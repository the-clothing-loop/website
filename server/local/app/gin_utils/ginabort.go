package gin_utils

import "github.com/gin-gonic/gin"

func GinAbortWithErrorBody(c *gin.Context, code int, err error) {
	c.String(code, err.Error())
	c.Writer.WriteHeaderNow()
	c.Abort()
	c.Error(err)
}
