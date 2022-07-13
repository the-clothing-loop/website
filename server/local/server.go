package local

import (
	"fmt"

	"github.com/CollActionteam/clothing-loop/local/controllers"
	"github.com/CollActionteam/clothing-loop/local/global"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/configor"
)

type Config struct {
	Host            string `yaml:"host" env:"SERVER_HOST"`
	Port            int    `yaml:"port" env:"SERVER_PORT"`
	JwtSecret       string `yaml:"jwt_secret" env:"SERVER_JWT_SECRET"`
	CookieDomain    string `yaml:"cookie_domain" env:"SERVER_COOKIE_DOMAIN"`
	CookieHttpsOnly bool   `yaml:"cookie_https_only" env:"SERVER_COOKIE_HTTPS_ONLY"`
	DBHost          string `yaml:"db_host" env:"SERVER_DB_HOST"`
	DBPort          int    `yaml:"db_port" env:"SERVER_DB_PORT"`
	DBName          string `yaml:"db_name" env:"SERVER_DB_NAME"`
	DBUser          string `yaml:"db_user" env:"SERVER_DB_USER"`
	DBPass          string `yaml:"db_pass" env:"SERVER_DB_PASS"`
	SMTPHost        string `yaml:"smtp_host" env:"SERVER_SMTP_HOST"`
	SMTPPort        int    `yaml:"smtp_port" env:"SERVER_SMTP_PORT"`
	SMTPSender      string `yaml:"smtp_sender" env:"SERVER_SMTP_SENDER"`
	SMTPUser        string `yaml:"smtp_user" env:"SERVER_SMTP_USER"`
	SMTPPass        string `yaml:"smtp_pass" env:"SERVER_SMTP_PASS"`
}

func Routes(c *Config) *gin.Engine {
	// initialization
	global.DatabaseInit(
		c.DBHost,
		c.DBPort,
		c.DBName,
		c.DBUser,
		c.DBPass,
	)
	global.MailInit(
		c.SMTPHost,
		c.SMTPPort,
		c.SMTPSender,
		c.SMTPUser,
		c.SMTPPass,
	)
	global.AuthInit([]byte(c.JwtSecret), c.CookieDomain, c.CookieHttpsOnly)

	// router
	r := gin.New()
	// login
	r.POST("/login/email/step1", controllers.LoginEmailStep1)
	r.DELETE("/login/email/step2", controllers.LoginEmailStep2)
	r.POST("/logout", controllers.Logout)
	// payments
	r.POST("/payments/initiate", controllers.PaymentsInitiate)
	r.POST("/payments/webhook", controllers.PaymentsWebhook)
	// user
	r.POST("/user/add-as-chain-admin", controllers.UserAddAsChainAdmin)
	r.GET("/user", controllers.UserGet)
	r.PATCH("/user", controllers.UserUpdate)
	r.PUT("/user", controllers.UserCreate)
	// contact
	r.POST("/contact/newsletter", controllers.ContactNewsletter)
	r.POST("/contact/mail", controllers.ContactMail)

	return r
}

func ConfigInit() *Config {
	var c Config
	if err := configor.New(&configor.Config{
		ENVPrefix:            "SERVER",
		ErrorOnUnmatchedKeys: true,
	}).Load(&c, "config.yml"); err != nil {
		panic(fmt.Errorf("error reading config: %s", err))
	}

	return &c
}
