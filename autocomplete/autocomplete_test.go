package main

import (
	"autocomplete/agent"
	"autocomplete/config"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

const testAutocompleteRateLimitToAgent = 5

type stubAgent struct {
	response *agent.GenerateResponse
	err      error
}

func (a stubAgent) Generate(ctx context.Context, prompt string) (*agent.GenerateResponse, error) {
	return a.response, a.err
}

type blockingAgent struct{}

func (a blockingAgent) Generate(ctx context.Context, prompt string) (*agent.GenerateResponse, error) {
	<-ctx.Done()
	return nil, ctx.Err()
}

type countingAgent struct {
	callCount int
}

func (a *countingAgent) Generate(ctx context.Context, prompt string) (*agent.GenerateResponse, error) {
	a.callCount++
	return &agent.GenerateResponse{Response: "agent response"}, nil
}

func TestAutocompleteHandlerFallsBackWhenAgentFails(t *testing.T) {
	response := requestAutocomplete(t, stubAgent{err: errors.New("upstream failed")})

	assertLoremIpsumResponse(t, response)
}

func TestAutocompleteHandlerFallsBackWhenAgentTimesOut(t *testing.T) {
	response := requestAutocompleteWithTimeout(t, blockingAgent{}, 1)

	assertLoremIpsumResponse(t, response)
}

func TestAutocompleteHandlerReturnsCleanAgentResponse(t *testing.T) {
	response := requestAutocomplete(t, stubAgent{
		response: &agent.GenerateResponse{Response: "<think>hidden</think>hello"},
	})

	if response.Predict != "hello" {
		t.Fatalf("response.Predict = %q, want %q", response.Predict, "hello")
	}
}

func TestAutocompleteHandlerLimitsAgentRequestsPerIP(t *testing.T) {
	testAgent := &countingAgent{}
	testServer := newTestServer(testAgent, 1)

	for i := 0; i < testAutocompleteRateLimitToAgent; i++ {
		response := requestAutocompleteFromIP(t, testServer, "203.0.113.1")
		if response.Predict != "agent response" {
			t.Fatalf("request %d response.Predict = %q, want %q", i+1, response.Predict, "agent response")
		}
	}

	response := requestAutocompleteFromIP(t, testServer, "203.0.113.1")
	assertLoremIpsumResponse(t, response)

	if testAgent.callCount != testAutocompleteRateLimitToAgent {
		t.Fatalf("agent call count = %d, want %d", testAgent.callCount, testAutocompleteRateLimitToAgent)
	}
}

func TestAutocompleteHandlerLimitsEachIPSeparately(t *testing.T) {
	testAgent := &countingAgent{}
	testServer := newTestServer(testAgent, 1)

	for i := 0; i < testAutocompleteRateLimitToAgent; i++ {
		requestAutocompleteFromIP(t, testServer, "203.0.113.1")
	}

	response := requestAutocompleteFromIP(t, testServer, "203.0.113.2")
	if response.Predict != "agent response" {
		t.Fatalf("response.Predict = %q, want %q", response.Predict, "agent response")
	}

	if testAgent.callCount != testAutocompleteRateLimitToAgent+1 {
		t.Fatalf("agent call count = %d, want %d", testAgent.callCount, testAutocompleteRateLimitToAgent+1)
	}
}

func requestAutocomplete(t *testing.T, testAgent agent.Agent) ResponseAutocomplete {
	t.Helper()

	return requestAutocompleteWithTimeout(t, testAgent, 1)
}

func requestAutocompleteWithTimeout(t *testing.T, testAgent agent.Agent, timeout int) ResponseAutocomplete {
	t.Helper()

	return requestAutocompleteFromIP(t, newTestServer(testAgent, timeout), "203.0.113.1")
}

func newTestServer(testAgent agent.Agent, timeout int) server {
	return server{
		agent: testAgent,
		config: config.Config{
			AutocompleteTimeout:          timeout,
			AutocompleteRateLimitToAgent: testAutocompleteRateLimitToAgent,
		},
		autocompleteRateLimiter: newClientRateLimiters(testAutocompleteRateLimitToAgent),
	}
}

func requestAutocompleteFromIP(t *testing.T, testServer server, ip string) ResponseAutocomplete {
	t.Helper()

	requestBody := bytes.NewBufferString(`{"input":"hello","cursor":5}`)
	request := httptest.NewRequest(http.MethodPost, "/autocomplete", requestBody)
	request.Header.Set("X-Forwarded-For", ip)
	recorder := httptest.NewRecorder()

	testServer.autocompleteHandler(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}

	var response ResponseAutocomplete
	if err := json.NewDecoder(recorder.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	return response
}

func assertLoremIpsumResponse(t *testing.T, response ResponseAutocomplete) {
	t.Helper()

	words := strings.Fields(response.Predict)
	if len(words) < 1 || len(words) > 8 {
		t.Fatalf("fallback word count = %d, want 1-8 words in %q", len(words), response.Predict)
	}

	allowedWords := make(map[string]bool, len(loremIpsumWords))
	for _, word := range loremIpsumWords {
		allowedWords[word] = true
	}

	for _, word := range words {
		if !allowedWords[word] {
			t.Fatalf("fallback word %q is not a lorem ipsum word in %q", word, response.Predict)
		}
	}
}
