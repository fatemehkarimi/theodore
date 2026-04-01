package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

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

	prompt := GeneratePrompt(requestAutoComplete)
	url := "http://localhost:11434/api/generate"

	payload := RequestGenerate{
		Model:  "gemma3:270m",
		Prompt: prompt,
		Stream: false,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error marshalling JSON:", err)
		return
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error making POST request:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, resp.Status, resp.StatusCode)
		return
	}

	var response ResponseGenerate
	err = json.NewDecoder(resp.Body).Decode(&response)

	finalResponse := ResponseAutocomplete{Predict: response.Response}
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

	handler := CORSMiddleware(mux)
	fmt.Println("Server is up and running at port 8080")
	http.ListenAndServe(":8080", handler)
}
