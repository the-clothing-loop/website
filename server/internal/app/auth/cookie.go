package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
)

// seconds in one year
const cookieMaxAge = 3600 * 24 * 365

func cookieRead(c *gin.Context) (string, bool) {
	token, err := c.Cookie(c.GetString("cookie_token"))

	return token, err == nil
}

func CookieRemove(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     c.GetString("cookie_token"),
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		Domain:   app.Config.COOKIE_DOMAIN,
		SameSite: http.SameSiteStrictMode,
		Secure:   app.Config.COOKIE_HTTPS_ONLY,
		HttpOnly: true,
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     c.GetString("cookie_user"),
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		Domain:   app.Config.COOKIE_DOMAIN,
		SameSite: http.SameSiteStrictMode,
		Secure:   app.Config.COOKIE_HTTPS_ONLY,
		HttpOnly: false,
	})
}

func CookieSet(c *gin.Context, userUID, token string) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     c.GetString("cookie_token"),
		Value:    token,
		MaxAge:   cookieMaxAge,
		Path:     "/",
		Domain:   app.Config.COOKIE_DOMAIN,
		SameSite: http.SameSiteStrictMode,
		Secure:   app.Config.COOKIE_HTTPS_ONLY,
		HttpOnly: true,
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     c.GetString("cookie_user"),
		Value:    userUID,
		MaxAge:   cookieMaxAge,
		Path:     "/",
		Domain:   app.Config.COOKIE_DOMAIN,
		SameSite: http.SameSiteStrictMode,
		Secure:   app.Config.COOKIE_HTTPS_ONLY,
		HttpOnly: false,
	})
}
