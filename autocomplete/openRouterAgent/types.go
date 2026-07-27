package openrouteragent

type chatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	MaxTokens   int           `json:"max_tokens"`
	Temperature float64       `json:"temperature"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatCompletionResponse struct {
	ID                string                 `json:"id"`
	Object            string                 `json:"object"`
	Created           int64                  `json:"created"`
	Model             string                 `json:"model"`
	Provider          string                 `json:"provider"`
	SystemFingerprint *string                `json:"system_fingerprint"`
	ServiceTier       *string                `json:"service_tier"`
	Choices           []chatCompletionChoice `json:"choices"`
	Usage             chatCompletionUsage    `json:"usage"`
}

type chatCompletionChoice struct {
	Index              int                   `json:"index"`
	Logprobs           any                   `json:"logprobs"`
	FinishReason       string                `json:"finish_reason"`
	NativeFinishReason string                `json:"native_finish_reason"`
	Message            chatCompletionMessage `json:"message"`
}

type chatCompletionMessage struct {
	Role      string  `json:"role"`
	Content   string  `json:"content"`
	Refusal   *string `json:"refusal"`
	Reasoning *string `json:"reasoning"`
}

type chatCompletionUsage struct {
	PromptTokens            int                     `json:"prompt_tokens"`
	CompletionTokens        int                     `json:"completion_tokens"`
	TotalTokens             int                     `json:"total_tokens"`
	Cost                    float64                 `json:"cost"`
	IsBYOK                  bool                    `json:"is_byok"`
	PromptTokensDetails     promptTokensDetails     `json:"prompt_tokens_details"`
	CostDetails             costDetails             `json:"cost_details"`
	CompletionTokensDetails completionTokensDetails `json:"completion_tokens_details"`
}

type promptTokensDetails struct {
	CachedTokens     int `json:"cached_tokens"`
	CacheWriteTokens int `json:"cache_write_tokens"`
	AudioTokens      int `json:"audio_tokens"`
	VideoTokens      int `json:"video_tokens"`
}

type costDetails struct {
	UpstreamInferenceCost            float64 `json:"upstream_inference_cost"`
	UpstreamInferencePromptCost      float64 `json:"upstream_inference_prompt_cost"`
	UpstreamInferenceCompletionsCost float64 `json:"upstream_inference_completions_cost"`
}

type completionTokensDetails struct {
	ReasoningTokens int `json:"reasoning_tokens"`
	ImageTokens     int `json:"image_tokens"`
	AudioTokens     int `json:"audio_tokens"`
}
