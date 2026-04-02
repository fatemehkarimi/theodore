.DEFAULT_GOAL := build
.PHONY: vet build

vet:
	go vet ./...

build: vet
	go build -o bin/autocomplete
