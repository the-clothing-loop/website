package local

import (
	"fmt"
	"io"
	"log"
	"os"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/controllers"
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
			log.Fatal("could not create log file at '%s'", logFilePath)
		}
		gin.DefaultWriter = io.MultiWriter(f)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// router
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(controllers.MiddlewareSetDB(db))

	// v1 router group
	v1 := r.Group("/v1")

	// login
	v1.POST("/register/basic-user", controllers.RegisterBasicUser)
	v1.POST("/register/chain-admin", controllers.RegisterChainAdmin)
	v1.POST("/login/email", controllers.LoginEmail)
	v1.GET("/login/validate", controllers.LoginValidate)
	v1.DELETE("/logout", controllers.Logout)

	// payments
	v1.POST("/payment/initiate", controllers.PaymentsInitiate)
	v1.POST("/payment/webhook", controllers.PaymentsWebhook)

	// user
	v1.GET("/user", controllers.UserGet)
	v1.GET("/user/all-chain", controllers.UserGetAllOfChain)
	v1.PATCH("/user", controllers.UserUpdate)
	v1.DELETE("/user", controllers.UserDelete)

	// chain
	v1.GET("/chain", controllers.ChainGet)
	v1.GET("/chain/all", controllers.ChainGetAll)
	v1.PATCH("/chain", controllers.ChainUpdate)
	v1.POST("/chain", controllers.ChainCreate)
	v1.POST("/chain/add-user", controllers.ChainAddUser)
	v1.POST("/chain/remove-user", controllers.ChainRemoveUser)

	// contact
	v1.POST("/contact/newsletter", controllers.ContactNewsletter)
	v1.POST("/contact/email", controllers.ContactMail)

	return r
}
