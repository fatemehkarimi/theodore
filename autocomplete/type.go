package main

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

type RequestChat struct {
	Messages []Message `json:"messages,omitempty"`
}

type ResponseChat struct {
	Response string `json:"response"`
}
