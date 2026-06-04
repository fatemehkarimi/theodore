package main

import "testing"

func TestCleanAgentResponseRemovesThinkBlocks(t *testing.T) {
	tests := []struct {
		name     string
		response string
		want     string
	}{
		{
			name: "complete block",
			response: `<think>
The model's private reasoning.
</think>

You're very special to me!`,
			want: "You're very special to me!",
		},
		{
			name:     "inline block",
			response: `Hello <think>hidden</think>world`,
			want:     "Hello world",
		},
		{
			name: "multiple blocks",
			response: `<think>first</think>
Hello
<think>second</think>`,
			want: "Hello",
		},
		{
			name:     "case insensitive",
			response: `<THINK>hidden</THINK>Visible`,
			want:     "Visible",
		},
		{
			name:     "unfinished block",
			response: `Visible<think>hidden`,
			want:     "Visible",
		},
		{
			name: "markdown thoughts after response",
			response: `سلام! ممنون، من خوبم. تو چطوری؟ امیدوارم حالت عالی باشه. 😊

    *Wait, I need to make sure I follow the "Output ONLY the reply" rule strictly.*
    *The instructions say: "Output ONLY the reply to the last message".*
    *However, the system instructions also say: "Every response that requires a thinking process must begin with a thinking process."*`,
			want: "سلام! ممنون، من خوبم. تو چطوری؟ امیدوارم حالت عالی باشه. 😊",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := cleanAgentResponse(tt.response)
			if got != tt.want {
				t.Fatalf("cleanAgentResponse() = %q, want %q", got, tt.want)
			}
		})
	}
}
