package app

import (
	"fmt"
	"os"

	"github.com/jinzhu/configor"
)

const (
	EnvEnumProduction  = "production"
	EnvEnumTesting     = "testing"
	EnvEnumDevelopment = "development"
)

var Config struct {
	ENV               string `yaml:"-" env:"SERVER_ENV"`
	HOST              string `yaml:"host" env:"SERVER_HOST"`
	PORT              int    `yaml:"port" env:"SERVER_PORT"`
	SITE_BASE_URL     string `yaml:"site_base_url" env:"SERVER_SITE_BASE_URL"`
	JWT_SECRET        string `yaml:"jwt_secret" env:"SERVER_JWT_SECRET"`
	COOKIE_DOMAIN     string `yaml:"cookie_domain" env:"SERVER_COOKIE_DOMAIN"`
	COOKIE_HTTPS_ONLY bool   `yaml:"cookie_https_only" env:"SERVER_COOKIE_HTTPS_ONLY"`
	DB_HOST           string `yaml:"db_host" env:"SERVER_DB_HOST"`
	DB_PORT           int    `yaml:"db_port" env:"SERVER_DB_PORT"`
	DB_NAME           string `yaml:"db_name" env:"SERVER_DB_NAME"`
	DB_USER           string `yaml:"db_user" env:"SERVER_DB_USER"`
	DB_PASS           string `yaml:"db_pass" env:"SERVER_DB_PASS"`
	SMTP_HOST         string `yaml:"smtp_host" env:"SERVER_SMTP_HOST"`
	SMTP_PORT         int    `yaml:"smtp_port" env:"SERVER_SMTP_PORT"`
	SMTP_SENDER       string `yaml:"smtp_sender" env:"SERVER_SMTP_SENDER"`
	SMTP_USER         string `yaml:"smtp_user" env:"SERVER_SMTP_USER"`
	SMTP_PASS         string `yaml:"smtp_pass" env:"SERVER_SMTP_PASS"`
}

func ConfigInit() {
	env := os.Getenv("SERVER_ENV")
	if env == "" {
		env = EnvEnumDevelopment
	}

	var file string
	switch env {
	case EnvEnumDevelopment:
		file = "config.dev.yml"
	case EnvEnumTesting:
		file = "config.test.yml"
	case EnvEnumProduction:
		file = "config.prod.yml"
	}

	if err := configor.New(&configor.Config{
		ENVPrefix:            "",
		ErrorOnUnmatchedKeys: true,
	}).Load(&Config, file); err != nil {
		panic(fmt.Errorf("error reading config: %s", err))
	}

	Config.ENV = env
}
