FROM golang:1.26.3-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
COPY agent ./agent
COPY arvanAgent ./arvanAgent
COPY config ./config
COPY localAgent ./localAgent

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/autocomplete .

FROM alpine:3.22

WORKDIR /app

COPY --from=builder /out/autocomplete /app/autocomplete

EXPOSE 8080

ENTRYPOINT ["/app/autocomplete"]
