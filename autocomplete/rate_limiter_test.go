package main

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"golang.org/x/time/rate"
)

func TestClientRateLimitersAllowsOnlyBurstUnderConcurrency(t *testing.T) {
	const requestCount = 100
	const requestsPerMinute = 3

	limiters := newClientRateLimiters(requestsPerMinute)
	var allowed atomic.Int32
	var requests sync.WaitGroup

	for i := 0; i < requestCount; i++ {
		requests.Add(1)

		go func() {
			defer requests.Done()

			if limiters.allow("203.0.113.1") {
				allowed.Add(1)
			}
		}()
	}

	requests.Wait()

	if allowed.Load() != requestsPerMinute {
		t.Fatalf("allowed requests = %d, want %d", allowed.Load(), requestsPerMinute)
	}
}

func TestAutocompleteRateLimiterRefillsConfiguredTokensPerMinute(t *testing.T) {
	const requestsPerMinute = 3

	limiter := newAutocompleteRateLimiter(requestsPerMinute)
	now := time.Now()

	assertAllowedRequests(t, limiter, now, requestsPerMinute)

	if limiter.AllowN(now, 1) {
		t.Fatal("request after initial burst was allowed")
	}

	oneMinuteLater := now.Add(time.Minute)
	assertAllowedRequests(t, limiter, oneMinuteLater, requestsPerMinute)

	if limiter.AllowN(oneMinuteLater, 1) {
		t.Fatal("request after refilled burst was allowed")
	}
}

func TestAutocompleteRateLimiterRejectsRequestsWhenDisabled(t *testing.T) {
	if newAutocompleteRateLimiter(0).Allow() {
		t.Fatal("request was allowed with a zero request limit")
	}
}

func assertAllowedRequests(t *testing.T, limiter *rate.Limiter, now time.Time, count int) {
	t.Helper()

	for i := 0; i < count; i++ {
		if !limiter.AllowN(now, 1) {
			t.Fatalf("request %d was rejected", i+1)
		}
	}
}
