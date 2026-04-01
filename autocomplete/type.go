package main

import "time"

type Message struct {
	Text string `json:"text"`
}

type RequstAutocomplete struct {
	Input    string    `json:"input"`
	Cursor   int       `json:"cursor"`
	Messages []Message `json:"messages,omitempty"`
}

type ResponseAutocomplete struct {
	Predict string `json:"predict"`
}

type RequestGenerate struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type ResponseGenerate struct {
	Model              string    `json:"model"`
	CreatedAt          time.Time `json:"created_at"`
	Response           string    `json:"response"`
	Done               bool      `json:"done"`
	DoneReason         string    `json:"done_reason"`
	Context            []int     `json:"context"`
	TotalDuration      int64     `json:"total_duration"`
	LoadDuration       int64     `json:"load_duration"`
	PromptEvalCount    int       `json:"prompt_eval_count"`
	PromptEvalDuration int64     `json:"prompt_eval_duration"`
	EvalCount          int       `json:"eval_count"`
	EvalDuration       int64     `json:"eval_duration"`
}
