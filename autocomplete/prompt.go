package main

import "fmt"

var PromptTemplate = `You are an autocomplete engine for a chat application.
Task:
Continue the user's message naturally.
- Keep it short (1–8 words)
- Do NOT repeat the input
- Do NOT explain
- Only output the completion
- Match the tone and style of the conversation.

Conversation:
%s

User is typing:
"%s" and the cursor postion is at %d`

func GeneratePrompt(r RequstAutocomplete) string {
	conversationMsgs := ""
	for _, m := range r.Messages {
		conversationMsgs += (m.Text + "\n")
	}

	prompt := fmt.Sprintf(PromptTemplate, conversationMsgs, r.Input, r.Cursor)

	return prompt
}
