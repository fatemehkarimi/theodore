package main

import "fmt"

var AutocompletePrompt = `Suggest autocomplete based on current text and cursor position. keep your suggestion 2-8 words and just tell the suggestion. do not repeat the input.
current text:
"%s" and the cursor postion is at %d
`

func GenerateAutocompletePrompt(r RequstAutocomplete) string {
	prompt := fmt.Sprintf(AutocompletePrompt, r.Input, r.Cursor)
	return prompt
}

var ChatPrompt = `You are a friend in an ongoing chat.

Your job is to reply to ONLY the LAST user message.

You are given the conversation history for context, but you must NOT respond to earlier messages.

--- Conversation History ---
%s

Last User Message:
%s
--- End of Conversation History ---

--- Instructions ---
- Identify the LAST user message in the conversation.
- Write a reply ONLY to that last message.
- Do NOT respond to multiple messages.
- Do NOT summarize the conversation.
- Do NOT continue the conversation from earlier turns.
- Use previous messages only as context.

--- Style ---
- Friendly and natural tone
- Keep it concise and clear
- Use emojis if appropriate (not too many)

--- Output Rules ---
- Output ONLY the reply to the last message
- No explanations
- No extra text
- No role labels (like "Assistant:")
- Do NOT include reasoning, analysis, self-checks, markdown thoughts, or <think> tags
- If you need to reason, do it silently and output only the final reply

Reply now.`

func GenerateChatPrompt(r RequestChat) string {
	conversationMsgs := ""
	for _, m := range r.Messages[1:] {
		conversationMsgs += (m.Text + "\n")
	}

	prompt := fmt.Sprintf(ChatPrompt, conversationMsgs, r.Messages[0].Text)

	return prompt
}
