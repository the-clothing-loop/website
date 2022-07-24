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
	app.AuthInit()

	// set gin mode
	if app.Config.ENV == app.EnvEnumProduction {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// router
	r := gin.New()

	r.Use(controllers.MiddlewareSetDB(db))
	// login
	r.POST("/login/email", controllers.LoginEmailStep1)
	r.POST("/register", controllers.Register)
	r.GET("/login/validate", controllers.LoginEmailStep2)
	r.DELETE("/logout", controllers.Logout)
	if app.Config.ENV == app.EnvEnumDevelopment {
		r.POST("/login/backdoor", controllers.LoginBackdoor)
	}

	// payments
	r.POST("/payments/initiate", controllers.PaymentsInitiate)
	r.POST("/payments/webhook", controllers.PaymentsWebhook)
	// user
	r.GET("/user", controllers.UserGet)
	r.PATCH("/user", controllers.UserUpdate)
	r.PUT("/user", controllers.UserCreate)
	r.POST("/user/add-as-chain-admin", controllers.UserAddAsChainAdmin)
	// contact
	r.POST("/contact/newsletter", controllers.ContactNewsletter)
	r.POST("/contact/email", controllers.ContactMail)

	return r
}
