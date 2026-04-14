package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

var LLM_MODEL = "qwen2.5:0.5b"
var allowedOrigins = map[string]struct{}{
	"https://theodore-js.dev":     {},
	"https://www.theodore-js.dev": {},
}

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := w.Header().Get("Origin")
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

func autocompleteHandler(w http.ResponseWriter, r *http.Request) {
	var requestAutoComplete RequstAutocomplete

	err := json.NewDecoder(r.Body).Decode(&requestAutoComplete)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	prompt := GenerateAutocompletePrompt(requestAutoComplete)
	response, err := requestGenerate(prompt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	finalResponse := ResponseAutocomplete{Predict: response.Response}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(finalResponse)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func requestGenerate(prompt string) (*ResponseGenerate, error) {
	url := "http://localhost:11434/api/generate"

	payload := RequestGenerate{
		Model:  LLM_MODEL,
		Prompt: prompt,
		Stream: false,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf(resp.Status)
	}

	var response ResponseGenerate
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return nil, err
	}

	return &response, nil
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	var requestChat RequestChat

	err := json.NewDecoder(r.Body).Decode(&requestChat)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	prompt := GenerateChatPrompt(requestChat)
	response, err := requestGenerate(prompt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	finalResponse := ResponseChat{Response: response.Response}
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(finalResponse)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/autocomplete", autocompleteHandler)
	mux.HandleFunc("/chat", chatHandler)

	handler := CORSMiddleware(mux)
	fmt.Println("Server is up and running at port 8080")
	http.ListenAndServe(":8080", handler)
}
