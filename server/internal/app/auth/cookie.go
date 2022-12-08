package auth

import (
	"github.com/CollActionteam/clothing-loop/server/internal/app"
	"github.com/gin-gonic/gin"
)

func cookieRead(c *gin.Context) (string, bool) {
	token, err := c.Cookie("token")

	return token, err == nil
}

func CookieRemove(c *gin.Context) {
	c.SetCookie("token", "", -1, "", "", app.Config.COOKIE_HTTPS_ONLY, true)
}

func CookieSet(c *gin.Context, token string) {
	c.SetCookie("token", token, 0, "/", app.Config.COOKIE_DOMAIN, app.Config.COOKIE_HTTPS_ONLY, true)
}
