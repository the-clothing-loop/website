package app

import (
	"flag"
	"fmt"
	"log/slog"
	"os"

	"github.com/jinzhu/configor"
	"github.com/stripe/stripe-go/v73"
)

const (
	EnvEnumProduction  = "production"
	EnvEnumAcceptance  = "acceptance"
	EnvEnumTesting     = "testing"
	EnvEnumDevelopment = "development"
)

var Config struct {
	ENV                     string `yaml:"-" env:"ENV"`
	HOST                    string `yaml:"host" env:"HOST"`
	PORT                    int    `yaml:"port" env:"PORT"`
	SITE_BASE_URL_API       string `yaml:"site_base_url_api" env:"SITE_BASE_URL_API"`
	SITE_BASE_URL_FE        string `yaml:"site_base_url_fe" env:"SITE_BASE_URL_FE"`
	COOKIE_DOMAIN           string `yaml:"cookie_domain" env:"COOKIE_DOMAIN"`
	COOKIE_HTTPS_ONLY       bool   `yaml:"cookie_https_only" env:"COOKIE_HTTPS_ONLY"`
	JWT_SECRET              string `yaml:"jwt_secret" env:"JWT_SECRET"`
	STRIPE_SECRET_KEY       string `yaml:"stripe_secret_key" env:"STRIPE_SECRET_KEY"`
	STRIPE_WEBHOOK          string `yaml:"stripe_webhook" env:"STRIPE_WEBHOOK"`
	DB_HOST                 string `yaml:"db_host" env:"DB_HOST"`
	DB_PORT                 int    `yaml:"db_port" env:"DB_PORT"`
	DB_NAME                 string `yaml:"db_name" env:"DB_NAME"`
	DB_USER                 string `yaml:"db_user" env:"DB_USER"`
	DB_PASS                 string `yaml:"db_pass" env:"DB_PASS"`
	SMTP_HOST               string `yaml:"smtp_host" env:"SMTP_HOST"`
	SMTP_PORT               int    `yaml:"smtp_port" env:"SMTP_PORT"`
	SMTP_SENDER             string `yaml:"smtp_sender" env:"SMTP_SENDER"`
	SMTP_USER               string `yaml:"smtp_user" env:"SMTP_USER"`
	SMTP_PASS               string `yaml:"smtp_pass" env:"SMTP_PASS"`
	GOSCOPE2_USER           string `yaml:"goscope2_user" env:"GOSCOPE2_USER"`
	GOSCOPE2_PASS           string `yaml:"goscope2_pass" env:"GOSCOPE2_PASS"`
	SENDINBLUE_API_KEY      string `yaml:"sendinblue_api_key" env:"SENDINBLUE_API_KEY"`
	IMGBB_KEY               string `yaml:"imgbb_key" env:"IMGBB_KEY"`
	ONESIGNAL_APP_ID        string `yaml:"onesignal_app_id" env:"ONESIGNAL_APP_ID"`
	ONESIGNAL_REST_API_KEY  string `yaml:"onesignal_rest_api_key" env:"ONESIGNAL_REST_API_KEY"`
	APPSTORE_REVIEWER_EMAIL string `yaml:"appstore_reviewer_email" env:"APPSTORE_REVIEWER_EMAIL"`
}

func ConfigInit(path string, files ...string) {
	fFile := flag.String("c", "", "config file")
	flag.Parse()
	if *fFile != "" {
		files = append(files, *fFile)
	}
	err := configor.Load(&Config, files...)
	if err != nil {
		slog.Error("Unable to set config", "err", err)
		os.Exit(1)
	}

	// var fname string
	// switch env {
	// case EnvEnumDevelopment:
	// 	fname = "config.dev.yml"
	// case EnvEnumTesting:
	// 	fname = "config.test.yml"
	// case EnvEnumAcceptance:
	// 	fname = "config.acc.yml"
	// case EnvEnumProduction:
	// 	fname = "config.prod.yml"
	// }

	if Config.JWT_SECRET == "" {
		panic(fmt.Errorf("no jwt secret in config file: %s", *fFile))
	}
	stripe.Key = Config.STRIPE_SECRET_KEY
}

func ConfigTestInit(path string) {
	os.Setenv("SERVER_ENV", EnvEnumTesting)
	os.Setenv("SERVER_NO_MIGRATE", "true")
	ConfigInit(path, "config.test.yml")
}
