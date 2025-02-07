package app

import (
	"encoding/base64"
	"flag"
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
	JWT_SECRET              string `yaml:"jwt_secret" env:"-"`
	JWT_SECRET_BASE64       string `yaml:"-" env:"JWT_SECRET"`
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
	IMAGES_DIR              string `yaml:"images_dir" env:"IMAGES_DIR"`
	MM_URL                  string `yaml:"mattermost_url" env:"MM_URL"`
	MM_TOKEN                string `yaml:"mattermost_token" env:"MM_TOKEN"`
	MM_SMTP_HOST            string `yaml:"mattermost_smtp_host" env:"MM_SMTP_HOST"`
	MM_SMTP_PORT            string `yaml:"mattermost_smtp_port" env:"MM_SMTP_PORT"`
}

func ConfigInit(pwd string, files ...string) {
	fFile := flag.String("c", "", "config file")
	flag.Parse()
	if *fFile != "" {
		files = append(files, *fFile)
	}
	if os.Getenv("ENV") == EnvEnumTesting {
		files = append(files, "config.test.yml")
	}
	congor := configor.New(nil)
	congor.FS = os.DirFS(pwd)
	err := congor.Load(&Config, files...)
	if err != nil {
		slog.Error("Unable to set config", "err", err)
		os.Exit(1)
	}

	if Config.JWT_SECRET_BASE64 != "" && Config.JWT_SECRET == "" {
		b, err := base64.StdEncoding.DecodeString(Config.JWT_SECRET_BASE64)
		if err != nil {
			slog.Error("Unable to set jwt secret config from base 64", "err", err)
			os.Exit(1)
		}
		Config.JWT_SECRET = string(b)
	}
	if Config.JWT_SECRET == "" {
		slog.Error("no jwt secret in config file", "file", *fFile)
		os.Exit(1)
	}

	stripe.Key = Config.STRIPE_SECRET_KEY
	if Config.ENV == "" {
		slog.Error("Config ENV is empty")
		os.Exit(1)
	}
}

func ConfigTestInit(path string) {
	os.Setenv("ENV", EnvEnumTesting)
	os.Setenv("SERVER_NO_MIGRATE", "true")
	ConfigInit(path, "config.test.yml")
}
