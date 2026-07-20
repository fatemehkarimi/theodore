package main

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type clientRateLimiters struct {
	requestsPerMinute int
	byIP              sync.Map
}

func newClientRateLimiters(requestsPerMinute int) *clientRateLimiters {
	return &clientRateLimiters{
		requestsPerMinute: requestsPerMinute,
	}
}

func newAutocompleteRateLimiter(requestsPerMinute int) *rate.Limiter {
	if requestsPerMinute <= 0 {
		return rate.NewLimiter(0, 0)
	}

	return rate.NewLimiter(
		rate.Limit(float64(requestsPerMinute)/time.Minute.Seconds()),
		requestsPerMinute,
	)
}

func (l *clientRateLimiters) allow(ip string) bool {
	limiter, ok := l.byIP.Load(ip)
	if !ok {
		limiter, _ = l.byIP.LoadOrStore(ip, newAutocompleteRateLimiter(l.requestsPerMinute))
	}

	return limiter.(*rate.Limiter).Allow()
}

func clientIP(r *http.Request) string {
	for _, forwardedIP := range strings.Split(r.Header.Get("X-Forwarded-For"), ",") {
		if ip := net.ParseIP(strings.TrimSpace(forwardedIP)); ip != nil {
			return ip.String()
		}
	}

	if ip := net.ParseIP(strings.TrimSpace(r.Header.Get("X-Real-IP"))); ip != nil {
		return ip.String()
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}

	return r.RemoteAddr
}
