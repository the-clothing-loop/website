package app

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/stripe/stripe-go/v73"
	"gopkg.in/yaml.v3"
)

const (
	EnvEnumProduction  = "production"
	EnvEnumAcceptance  = "acceptance"
	EnvEnumTesting     = "testing"
	EnvEnumDevelopment = "development"
)

var Config struct {
	ENV                    string `yaml:"-"`
	HOST                   string `yaml:"host"`
	PORT                   int    `yaml:"port"`
	SITE_BASE_URL_API      string `yaml:"site_base_url_api"`
	SITE_BASE_URL_FE       string `yaml:"site_base_url_fe"`
	COOKIE_DOMAIN          string `yaml:"cookie_domain"`
	COOKIE_HTTPS_ONLY      bool   `yaml:"cookie_https_only"`
	STRIPE_SECRET_KEY      string `yaml:"stripe_secret_key"`
	STRIPE_WEBHOOK         string `yaml:"stripe_webhook"`
	DB_HOST                string `yaml:"db_host"`
	DB_PORT                int    `yaml:"db_port"`
	DB_NAME                string `yaml:"db_name"`
	DB_USER                string `yaml:"db_user"`
	DB_PASS                string `yaml:"db_pass"`
	SMTP_HOST              string `yaml:"smtp_host"`
	SMTP_PORT              int    `yaml:"smtp_port"`
	SMTP_SENDER            string `yaml:"smtp_sender"`
	SMTP_USER              string `yaml:"smtp_user"`
	SMTP_PASS              string `yaml:"smtp_pass"`
	GOSCOPE2_USER          string `yaml:"goscope2_user"`
	GOSCOPE2_PASS          string `yaml:"goscope2_pass"`
	SENDINBLUE_API_KEY     string `yaml:"sendinblue_api_key"`
	IMGBB_KEY              string `yaml:"imgbb_key"`
	ONESIGNAL_APP_ID       string `yaml:"onesignal_app_id"`
	ONESIGNAL_REST_API_KEY string `yaml:"onesignal_rest_api_key"`
}

func ConfigInit(path string) {
	env := os.Getenv("SERVER_ENV")
	if env == "" {
		env = EnvEnumDevelopment
	}

	var fname string
	switch env {
	case EnvEnumDevelopment:
		fname = "config.dev.yml"
	case EnvEnumTesting:
		fname = "config.test.yml"
	case EnvEnumAcceptance:
		fname = "config.acc.yml"
	case EnvEnumProduction:
		fname = "config.prod.yml"
	}

	fpath := filepath.Join(path, fname)

	fdata, err := os.ReadFile(fpath)
	if err != nil {
		panic(fmt.Errorf("error reading config: %s", err))
	}

	err = yaml.Unmarshal(fdata, &Config)
	if err != nil {
		panic(fmt.Errorf("error reading config: %s", err))
	}

	Config.ENV = env
	stripe.Key = Config.STRIPE_SECRET_KEY
}

func ConfigTestInit(path string) {
	os.Setenv("SERVER_ENV", EnvEnumTesting)
	os.Setenv("SERVER_NO_MIGRATE", "true")
	ConfigInit(path)
}
