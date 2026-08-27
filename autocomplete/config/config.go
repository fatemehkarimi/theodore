package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	AllowedOrigin                []string
	AgentMode                    string
	AutocompleteTimeout          int
	AutocompleteRateLimitToAgent int
	LocalAgent                   struct {
		Endpoint string
		Model    string
	}
	ArvanAgent struct {
		Endpoint           string
		MaxTokens          int
		Temprature         float64
		RemoteAgentTimeout int
	}
	OpenRouterAgent struct {
		Endpoint           string
		MaxTokens          int
		Temprature         float64
		Model              string
		FallbackModel      string
		RemoteAgentTimeout int
	}
}

func ReadConfig() Config {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		panic(fmt.Errorf("fatal error config file: %w", err))
	}

	c := Config{}

	// general
	c.AllowedOrigin = viper.GetStringSlice("app.origin")
	c.AgentMode = viper.GetString("app.agent.mode")
	c.AutocompleteTimeout = viper.GetInt("app.autocomplete.timeout")
	c.AutocompleteRateLimitToAgent = viper.GetInt("app.autocomplete.rate_limit_to_agent")

	// local agent
	c.LocalAgent.Model = viper.GetString("app.agent.local.model")
	c.LocalAgent.Endpoint = viper.GetString("app.agent.local.endpoint")

	// arvan
	c.ArvanAgent.Endpoint = viper.GetString("app.agent.arvan.endpoint")
	c.ArvanAgent.MaxTokens = viper.GetInt("app.agent.arvan.max_tokens")
	c.ArvanAgent.Temprature = viper.GetFloat64("app.agent.arvan.temprature")
	c.ArvanAgent.RemoteAgentTimeout = viper.GetInt("app.agent.arvan.remote_agent_timeout")

	// openrouter
	c.OpenRouterAgent.Endpoint = viper.GetString("app.agent.openrouter.endpoint")
	c.OpenRouterAgent.MaxTokens = viper.GetInt("app.agent.openrouter.max_tokens")
	c.OpenRouterAgent.Temprature = viper.GetFloat64("app.agent.openrouter.temprature")
	c.OpenRouterAgent.Model = viper.GetString("app.agent.openrouter.model")
	c.OpenRouterAgent.FallbackModel = viper.GetString("app.agent.openrouter.fallback_model")
	c.OpenRouterAgent.RemoteAgentTimeout = viper.GetInt("app.agent.openrouter.remote_agent_timeout")

	return c
}
