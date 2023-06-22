package internal

import (
	"fmt"
	"io"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/controllers"
)

func Routes() *gin.Engine {
	// initialization
	db := app.DatabaseInit()
	app.MailInit()

	if app.Config.ENV == app.EnvEnumProduction || (app.Config.SENDINBLUE_API_KEY != "" && app.Config.ENV == app.EnvEnumDevelopment) {
		app.SendInBlueInit()
	}

	if app.Config.ENV != app.EnvEnumTesting {
		app.CronInit(db)
	}

	// set gin mode
	if app.Config.ENV == app.EnvEnumProduction || app.Config.ENV == app.EnvEnumAcceptance {
		gin.SetMode(gin.ReleaseMode)

		// create log file if does not exist and write to it
		logFilePath := fmt.Sprintf("/var/log/clothingloop-api/%s.log", app.Config.ENV)
		f, err := os.Create(logFilePath)
		if err != nil {
			glog.Fatalf("could not create log file at '%s'", logFilePath)
		}
		gin.DefaultWriter = io.MultiWriter(f)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// router
	r := gin.New()
	r.Use(gin.Logger())
	goscope.GoScope2Init(r, db,
		app.Config.GOSCOPE2_USER,
		app.Config.GOSCOPE2_PASS,
	)
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
	v2.POST("/register/chain-admin", controllers.RegisterChainAdmin)
	v2.POST("/login/email", controllers.LoginEmail)
	v2.GET("/login/validate", controllers.LoginValidate)
	v2.DELETE("/logout", controllers.Logout)

	// payments
	v2.POST("/payment/initiate", controllers.PaymentsInitiate)
	v2.POST("/payment/webhook", controllers.PaymentsWebhook)

	// user
	v2.GET("/user", controllers.UserGet)
	v2.GET("/user/all-chain", controllers.UserGetAllOfChain)
	v2.GET("/user/newsletter", controllers.UserHasNewsletter)
	v2.PATCH("/user", controllers.UserUpdate)
	v2.DELETE("/user", controllers.UserDelete)
	v2.DELETE("/user/purge", controllers.UserPurge)
	v2.POST("/user/transfer-chain", controllers.UserTransferChain)

	// chain
	v2.GET("/chain", controllers.ChainGet)
	v2.GET("/chain/all", controllers.ChainGetAll)
	v2.PATCH("/chain", controllers.ChainUpdate)
	v2.POST("/chain", controllers.ChainCreate)
	v2.POST("/chain/add-user", controllers.ChainAddUser)
	v2.POST("/chain/remove-user", controllers.ChainRemoveUser)
	v2.PATCH("/chain/approve-user", controllers.ChainApproveUser)
	v2.DELETE("/chain/unapproved-user", controllers.ChainDeleteUnapproved)
	v2.POST("/chain/poke", controllers.Poke)

	// bag
	v2.GET("/bag/all", controllers.BagGetAll)
	v2.PUT("/bag", controllers.BagPut)
	v2.DELETE("/bag", controllers.BagRemove)

	// bulky item
	v2.GET("/bulky-item/all", controllers.BulkyGetAll)
	v2.PUT("/bulky-item", controllers.BulkyPut)
	v2.DELETE("/bulky-item", controllers.BulkyRemove)

	// imgbb
	v2.POST("/image", controllers.ImageUpload)
	v2.DELETE("/image", controllers.ImageDelete)

	// route
	v2.GET("/route/order", controllers.RouteOrderGet)
	v2.POST("/route/order", controllers.RouteOrderSet)

	// contact
	v2.POST("/contact/newsletter", controllers.ContactNewsletter)
	v2.POST("/contact/email", controllers.ContactMail)

	// event
	v2.GET("/event/:uid/ical", controllers.EventICal)
	v2.GET("/event/:uid", controllers.EventGet)
	v2.GET("/event/all", controllers.EventGetAll)
	v2.GET("/event/previous", controllers.EventGetPrevious)
	v2.POST("/event", controllers.EventCreate)
	v2.PATCH("/event", controllers.EventUpdate)
	v2.DELETE("/event/:uid", controllers.EventDelete)

	// onesignal
	v2.PUT("/onesignal/player", controllers.OneSignalPlayerPut)
	v2.DELETE("onesignal/player/:player_id", controllers.OneSignalPlayerDelete)

	return r
}
