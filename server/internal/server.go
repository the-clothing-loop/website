package internal

import (
	"fmt"
	"io"
	"log"
	"os"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	"github.com/CollActionteam/clothing-loop/server/internal/controllers"
	"github.com/gin-gonic/gin"
)

func Routes() *gin.Engine {
	// initialization
	db := app.DatabaseInit()
	app.MailInit()

	// set gin mode
	if app.Config.ENV == app.EnvEnumProduction || app.Config.ENV == app.EnvEnumAcceptance {
		gin.SetMode(gin.ReleaseMode)

		// create log file if does not exist and write to it
		logFilePath := fmt.Sprintf("/var/log/clothingloop-api/%s.log", app.Config.ENV)
		f, err := os.Create(logFilePath)
		if err != nil {
			log.Fatalf("could not create log file at '%s'", logFilePath)
		}
		gin.DefaultWriter = io.MultiWriter(f)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// router
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(controllers.MiddlewareSetDB(db))

	// router groups
	v2 := r.Group("/v2")

	// ping
	v2.Any("/ping", func(c *gin.Context) {
		c.String(200, "pong")
	})

	// info
	v2.GET("/info", controllers.InfoGet)

	// login
	v2.POST("/register/basic-user", controllers.RegisterBasicUser)
	v2.OPTIONS("/register/basic-user", controllers.Preflight)
	v2.POST("/register/chain-admin", controllers.RegisterChainAdmin)
	v2.OPTIONS("/register/chain-admin", controllers.Preflight)
	v2.POST("/login/email", controllers.LoginEmail)
	v2.OPTIONS("/login/email", controllers.Preflight)
	v2.GET("/login/validate", controllers.LoginValidate)
	v2.DELETE("/logout", controllers.Logout)
	v2.OPTIONS("/logout", controllers.Preflight)

	// payments
	v2.POST("/payment/initiate", controllers.PaymentsInitiate)
	v2.OPTIONS("/payment/initiate", controllers.Preflight)
	v2.POST("/payment/webhook", controllers.PaymentsWebhook)
	v2.OPTIONS("/payment/webhook", controllers.Preflight)

	// user
	v2.GET("/user", controllers.UserGet)
	v2.GET("/user/all-chain", controllers.UserGetAllOfChain)
	v2.PATCH("/user", controllers.UserUpdate)
	v2.DELETE("/user", controllers.UserDelete)
	v2.OPTIONS("/user", controllers.Preflight)

	// chain
	v2.GET("/chain", controllers.ChainGet)
	v2.GET("/chain/all", controllers.ChainGetAll)
	v2.PATCH("/chain", controllers.ChainUpdate)
	v2.POST("/chain", controllers.ChainCreate)
	v2.OPTIONS("/chain", controllers.Preflight)
	v2.POST("/chain/add-user", controllers.ChainAddUser)
	v2.OPTIONS("/chain/add-user", controllers.Preflight)
	v2.POST("/chain/remove-user", controllers.ChainRemoveUser)
	v2.OPTIONS("/chain/remove-user", controllers.Preflight)

	// contact
	v2.POST("/contact/newsletter", controllers.ContactNewsletter)
	v2.OPTIONS("/contact/newsletter", controllers.Preflight)
	v2.POST("/contact/email", controllers.ContactMail)
	v2.OPTIONS("/contact/email", controllers.Preflight)

	return r
}
