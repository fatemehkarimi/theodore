package main

import (
	"autocomplete/agent"
	arvanagent "autocomplete/arvanAgent"
	"autocomplete/config"
	localagent "autocomplete/localAgent"
	openrouteragent "autocomplete/openRouterAgent"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type server struct {
	agent                   agent.Agent
	config                  config.Config
	autocompleteRateLimiter *clientRateLimiters
}

func createCORSMiddleware(cfg config.Config) func(http.Handler) http.Handler {
	allowedOrigins := make(map[string]struct{}, len(cfg.AllowedOrigin))
	for _, origin := range cfg.AllowedOrigin {
		allowedOrigins[origin] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if _, ok := allowedOrigins[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
			}

			if r.Method == http.MethodOptions {
				w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func (s server) autocompleteHandler(w http.ResponseWriter, r *http.Request) {
	var requestAutoComplete RequstAutocomplete

	err := json.NewDecoder(r.Body).Decode(&requestAutoComplete)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	prompt := GenerateAutocompletePrompt(requestAutoComplete)

	clientIP := clientIP(r)
	isAllowed := s.autocompleteRateLimiter.allow(clientIP)
	log.Printf("Checking limit for ip %s %t", clientIP, isAllowed)
	if s.autocompleteRateLimiter != nil && !isAllowed {
		writeAutocompleteResponse(w, ResponseAutocomplete{Predict: randomLoremIpsum()})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), time.Duration(s.config.AutocompleteTimeout)*time.Second)
	defer cancel()

	response, err := s.agent.Generate(ctx, prompt)
	if err != nil {
		writeAutocompleteResponse(w, ResponseAutocomplete{Predict: randomLoremIpsum()})
		log.Printf("autocomplete agent error: %v", err)
		return
	}

	writeAutocompleteResponse(w, ResponseAutocomplete{Predict: cleanAgentResponse(response.Response)})
}

func writeAutocompleteResponse(w http.ResponseWriter, response ResponseAutocomplete) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (s server) chatHandler(w http.ResponseWriter, r *http.Request) {
	var requestChat RequestChat

	err := json.NewDecoder(r.Body).Decode(&requestChat)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	prompt := GenerateChatPrompt(requestChat)
	response, err := s.agent.Generate(r.Context(), prompt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	finalResponse := ResponseChat{Response: cleanAgentResponse(response.Response)}
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(finalResponse)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func main() {

	cfg := config.ReadConfig()

	var agent agent.Agent

	switch cfg.AgentMode {
	case "local":
		agent = localagent.New(cfg)
	case "arvan":
		agent = arvanagent.New(cfg)
	default:
		agent = openrouteragent.New(cfg)
	}

	mux := http.NewServeMux()

	server := server{
		agent:                   agent,
		config:                  cfg,
		autocompleteRateLimiter: newClientRateLimiters(cfg.AutocompleteRateLimitToAgent),
	}

	mux.HandleFunc("/autocomplete", server.autocompleteHandler)
	// mux.HandleFunc("/chat", server.chatHandler)

	handler := createCORSMiddleware(cfg)(mux)
	fmt.Println("Server is up and running at port 8080")
	http.ListenAndServe(":8080", handler)
}
