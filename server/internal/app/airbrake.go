package app

import (
	glog "github.com/airbrake/glog/v4"
	"github.com/airbrake/gobrake/v5"
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

		glog.SetGobrakeNotifier(notifier)

		r.Use(ginbrake.New(notifier))
	}

	notifier = gobrake.NewNotifierWithOptions(&gobrake.NotifierOptions{
		ProjectId:   469844,
		ProjectKey:  "54266d5c3488dee6d57c2d8b75fbe84a",
		Environment: "development",
	})

	glog.SetGobrakeNotifier(notifier)

	r.Use(ginbrake.New(notifier))
}
