package openrouteragent

import (
	"autocomplete/agent"
	"autocomplete/config"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type OpenRouterAgent struct {
	config config.Config
}

func New(cfg config.Config) OpenRouterAgent {
	return OpenRouterAgent{config: cfg}
}

func (oa OpenRouterAgent) Generate(ctx context.Context, prompt string) (*agent.GenerateResponse, error) {
	endpoint := oa.config.OpenRouterAgent.Endpoint
	apiKey := os.Getenv("OPEN_ROUTER_API_KEY")

	if apiKey == "" {
		return nil, fmt.Errorf("OPEN ROUTER API KEY environment variable is not set")
	}

	var fallbackModels []string
	if oa.config.OpenRouterAgent.FallbackModel != "" {
		fallbackModels = []string{oa.config.OpenRouterAgent.FallbackModel}
	}

	payload := chatCompletionRequest{
		Model:  oa.config.OpenRouterAgent.Model,
		Models: fallbackModels,
		Messages: []chatMessage{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens:   oa.config.OpenRouterAgent.MaxTokens,
		Temperature: oa.config.ArvanAgent.Temprature,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewBuffer((jsonData)))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{Timeout: time.Duration(oa.config.OpenRouterAgent.RemoteAgentTimeout) * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("openrouter agent request failed: %s: %s", resp.Status, string(body))
	}

	var response chatCompletionResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	if len(response.Choices) == 0 {
		return nil, fmt.Errorf("openrouter agent response has no choices")
	}

	return &agent.GenerateResponse{
		Model:      response.Model,
		Response:   response.Choices[0].Message.Content,
		Done:       true,
		DoneReason: response.Choices[0].FinishReason,
	}, nil
}
