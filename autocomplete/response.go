package main

import (
	"regexp"
	"strings"
)

var completeThinkBlockPattern = regexp.MustCompile(`(?is)<think\b[^>]*>.*?</think>`)
var openThinkBlockPattern = regexp.MustCompile(`(?is)<think\b[^>]*>.*`)
var leakedThoughtLinePattern = regexp.MustCompile(`(?im)^[ \t]*(?:[-*][ \t]*)?[*_](?:wait\b|wait[, ]|i need to|i should|i must|i'll|let's|the instructions|the system instructions|system instructions|output rules|core operational rules|there is a conflict|standard behavior|looking at|however,|actually,|usually,|in many|since i|this is a hard constraint).*[*_][ \t]*$`)

func cleanAgentResponse(response string) string {
	response = completeThinkBlockPattern.ReplaceAllString(response, "")
	response = openThinkBlockPattern.ReplaceAllString(response, "")

	if leakedThoughtLocation := leakedThoughtLinePattern.FindStringIndex(response); leakedThoughtLocation != nil {
		response = response[:leakedThoughtLocation[0]]
	}

	return strings.TrimSpace(response)
}
