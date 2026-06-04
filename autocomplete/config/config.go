package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	AllowedOrigin []string
	AgentMode     string
	LocalAgent    struct {
		Endpoint string
		Model    string
	}
	ArvanAgent struct {
		Endpoint           string
		MaxTokens          int
		Temprature         float64
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

	c.AllowedOrigin = viper.GetStringSlice("app.origin")
	c.AgentMode = viper.GetString("app.agent.mode")

	c.LocalAgent.Model = viper.GetString("app.agent.local.model")
	c.LocalAgent.Endpoint = viper.GetString("app.agent.local.endpoint")

	c.ArvanAgent.Endpoint = viper.GetString("app.agent.arvan.endpoint")
	c.ArvanAgent.MaxTokens = viper.GetInt("app.agent.arvan.max_tokens")
	c.ArvanAgent.Temprature = viper.GetFloat64("app.agent.arvan.temprature")
	c.ArvanAgent.RemoteAgentTimeout = viper.GetInt("app.agent.arvan.remote_agent_timeout")

	return c
}
