package local

import (
	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/controllers"
	"github.com/gin-gonic/gin"
)

func Routes() *gin.Engine {
	// initialization
	db := app.DatabaseInit()
	app.MailInit()

	// set gin mode
	if app.Config.ENV == app.EnvEnumProduction {
		gin.SetMode(gin.ReleaseMode)
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
	// TODO: one off + recurring -- stripe
	v1.POST("/payments/initiate", controllers.PaymentsInitiate)
	v1.POST("/payments/webhook", controllers.PaymentsWebhook)

	// user
	v1.GET("/user", controllers.UserGet)
	v1.PATCH("/user", controllers.UserUpdate)
	v1.DELETE("/user", controllers.UserDelete)

	// chain
	// TODO
	v1.GET("/chain", controllers.ChainGet)
	v1.GET("/chain/all", controllers.ChainGetAll)
	v1.PATCH("/chain", controllers.ChainUpdate)
	v1.POST("/chain", controllers.ChainCreate)
	v1.POST("/chain/add-user", controllers.ChainAddUser)

	// contact
	v1.POST("/contact/newsletter", controllers.ContactNewsletter)
	v1.POST("/contact/email", controllers.ContactMail)

	return r
}
