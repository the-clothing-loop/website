package gin_utils

import (
	glog "github.com/airbrake/glog/v4"
	"github.com/gin-gonic/gin"
)

func GinAbortWithErrorBody(c *gin.Context, code int, err error) {
	c.String(code, err.Error())
	c.Writer.WriteHeaderNow()
	if code >= 500 {
		glog.Error(err)
	}
	c.Abort()
}
