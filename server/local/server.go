package local

import (
	"github.com/CollActionteam/clothing-loop/server/local/controllers"
	"github.com/CollActionteam/clothing-loop/server/local/global"
	"github.com/gin-gonic/gin"
)

func Routes() *gin.Engine {
	// initialization
	global.DatabaseInit()
	global.AuthInit()

	// router
	r := gin.New()
	// login
	r.POST("/login/email/step1", controllers.LoginEmailStep1)
	r.POST("/login/email/step2", controllers.LoginEmailStep2)
	r.DELETE("/logout", controllers.Logout)
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
	r.POST("/contact/mail", controllers.ContactMail)

	return r
}
