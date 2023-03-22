package auth

import (
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
)

// seconds in one year
const cookieMaxAge = 3600 * 24 * 365

func cookieRead(c *gin.Context) (string, bool) {
	token, err := c.Cookie("token")

	return token, err == nil
}

func CookieRemove(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    url.QueryEscape(""),
		MaxAge:   -1,
		Path:     "/",
		Domain:   "",
		SameSite: http.SameSiteStrictMode,
		Secure:   app.Config.COOKIE_HTTPS_ONLY,
		HttpOnly: true,
	})
}

func CookieSet(c *gin.Context, token string) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    url.QueryEscape(token),
		MaxAge:   cookieMaxAge,
		Path:     "/",
		Domain:   app.Config.COOKIE_DOMAIN,
		SameSite: http.SameSiteStrictMode,
		Secure:   app.Config.COOKIE_HTTPS_ONLY,
		HttpOnly: true,
	})
}
