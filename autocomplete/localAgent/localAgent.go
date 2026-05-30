package localagent

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"autocomplete/agent"
	"autocomplete/config"
)

type LocalAgent struct {
	config config.Config
}

func New(cfg config.Config) LocalAgent {
	return LocalAgent{config: cfg}
}

func (la LocalAgent) Generate(prompt string) (*agent.GenerateResponse, error) {
	url := la.config.LocalAgent.Endpoint

	payload := agent.GenerateRequest{
		Model:  la.config.LocalAgent.Model,
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
		return nil, fmt.Errorf("local agent request failed: %s", resp.Status)
	}

	var response agent.GenerateResponse
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return nil, err
	}

	return &response, nil
}
