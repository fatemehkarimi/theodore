package arvanagent

import (
	"autocomplete/agent"
	"autocomplete/config"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type ArvanAgent struct {
	config config.Config
}

func New(cfg config.Config) ArvanAgent {
	return ArvanAgent{config: cfg}
}

func (aa ArvanAgent) Generate(prompt string) (*agent.GenerateResponse, error) {
	url := aa.config.ArvanAgent.Endpoint
	apiKey := os.Getenv("ARVAN_MACHINE_USER")
	if apiKey == "" {
		return nil, fmt.Errorf("ARVAN_MACHINE_USER environment variable is not set")
	}

	payload := chatCompletionRequest{
		Model: "",
		Messages: []chatMessage{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens:   aa.config.ArvanAgent.MaxTokens,
		Temperature: aa.config.ArvanAgent.Temprature,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("apikey %s", apiKey))
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{Timeout: time.Duration(aa.config.ArvanAgent.RemoteAgentTimeout) * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("arvan agent request failed: %s: %s", resp.Status, string(body))
	}

	var response chatCompletionResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	if len(response.Choices) == 0 {
		return nil, fmt.Errorf("arvan agent response has no choices")
	}

	return &agent.GenerateResponse{
		Model:      response.Model,
		Response:   response.Choices[0].Message.Content,
		Done:       true,
		DoneReason: response.Choices[0].FinishReason,
	}, nil
}
