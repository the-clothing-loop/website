package global

import (
	"fmt"

	"github.com/jinzhu/configor"
)

var Config struct {
	Host            string `yaml:"host" env:"SERVER_HOST"`
	Port            int    `yaml:"port" env:"SERVER_PORT"`
	SiteBaseUrl     string `yaml:"site_base_url" env:"SITE_BASE_URL"`
	JwtSecret       string `yaml:"jwt_secret" env:"SERVER_JWT_SECRET"`
	CookieDomain    string `yaml:"cookie_domain" env:"SERVER_COOKIE_DOMAIN"`
	CookieHttpsOnly bool   `yaml:"cookie_https_only" env:"SERVER_COOKIE_HTTPS_ONLY"`
	DBHost          string `yaml:"db_host" env:"SERVER_DB_HOST"`
	DBPort          int    `yaml:"db_port" env:"SERVER_DB_PORT"`
	DBName          string `yaml:"db_name" env:"SERVER_DB_NAME"`
	DBUser          string `yaml:"db_user" env:"SERVER_DB_USER"`
	DBPass          string `yaml:"db_pass" env:"SERVER_DB_PASS"`
	SmtpHost        string `yaml:"smtp_host" env:"SERVER_SMTP_HOST"`
	SmtpPort        int    `yaml:"smtp_port" env:"SERVER_SMTP_PORT"`
	SmtpSender      string `yaml:"smtp_sender" env:"SERVER_SMTP_SENDER"`
	SmtpUser        string `yaml:"smtp_user" env:"SERVER_SMTP_USER"`
	SmtpPass        string `yaml:"smtp_pass" env:"SERVER_SMTP_PASS"`
}

func ConfigInit(file string) {
	if err := configor.New(&configor.Config{
		ENVPrefix:            "SERVER",
		ErrorOnUnmatchedKeys: true,
	}).Load(&Config, file); err != nil {
		panic(fmt.Errorf("error reading config: %s", err))
	}
}
