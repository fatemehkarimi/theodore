package main

import (
	"math/rand"
	"strings"
)

var loremIpsumWords = []string{
	"lorem",
	"ipsum",
	"dolor",
	"sit",
	"amet",
	"consectetur",
	"adipiscing",
	"elit",
}

func randomLoremIpsum() string {
	wordCount := rand.Intn(8) + 1
	words := make([]string, wordCount)

	for i := range words {
		words[i] = loremIpsumWords[rand.Intn(len(loremIpsumWords))]
	}

	return strings.Join(words, " ")
}
