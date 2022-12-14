package app

import (
	gobrake "github.com/airbrake/gobrake/v5"
	ginbrake "github.com/airbrake/gobrake/v5/gin"
	"github.com/gin-gonic/gin"
)

var notifier *gobrake.Notifier

func AirbrakeInit(r *gin.Engine) {
	if Config.ENV == EnvEnumProduction {
		notifier = gobrake.NewNotifierWithOptions(&gobrake.NotifierOptions{
			ProjectId:   469844,
			ProjectKey:  "54266d5c3488dee6d57c2d8b75fbe84a",
			Environment: "production",
		})

		r.Use(ginbrake.New(notifier))
	}
}
