package ginext

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func AbortWithErrorInBody(c *gin.Context, code int, err error, body string) {
	c.Error(fmt.Errorf("%s: %w", body, err))
	c.String(code, body)
	c.Abort()
}
