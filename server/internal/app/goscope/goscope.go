package goscope

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lil5/goscope2"
	"gorm.io/gorm"
)

var Log *goscope2.GoScope2

func GoScope2Init(r *gin.Engine, db *gorm.DB, user, pass string) {
	Log = goscope2.New(goscope2.GoScope2{
		DB:            db,
		LimitLogs:     3000,
		JsToken:       "469844",
		AllowedOrigin: []string{"acc.clothingloop.org", "www.clothingloop.org", "localhost"},
		AuthUser:      user,
		AuthPass:      pass,
	})

	r.Use(Log.AddGinMiddleware(http.StatusInternalServerError))
	Log.AddRoutes(&r.RouterGroup)
}
