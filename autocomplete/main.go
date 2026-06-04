package main

import (
	"autocomplete/agent"
	arvanagent "autocomplete/arvanAgent"
	"autocomplete/config"
	localagent "autocomplete/localAgent"
	"encoding/json"
	"fmt"
	"net/http"
)

type server struct {
	agent agent.Agent
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
	response, err := s.agent.Generate(prompt)
	if err != nil {
		writeAutocompleteResponse(w, ResponseAutocomplete{Predict: randomLoremIpsum()})
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
	response, err := s.agent.Generate(prompt)
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

	if cfg.AgentMode == "local" {
		agent = localagent.New(cfg)
	} else {
		agent = arvanagent.New(cfg)
	}

	mux := http.NewServeMux()

	server := server{agent: agent}

	mux.HandleFunc("/autocomplete", server.autocompleteHandler)
	mux.HandleFunc("/chat", server.chatHandler)

	handler := createCORSMiddleware(cfg)(mux)
	fmt.Println("Server is up and running at port 8080")
	http.ListenAndServe(":8080", handler)
}
