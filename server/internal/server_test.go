package internal_test

import (
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app"
)

func TestGinCookie(t *testing.T) {
	f := func(key, env string) string {
		t.Helper()
		c, _ := gin.CreateTestContext(nil)

		// Start server.go:73
		var cookieToken = "token"
		var cookieUser = "user_uid"

		switch env {
		case app.EnvEnumProduction:
		case app.EnvEnumAcceptance:
			cookieToken += "_acc"
			cookieUser += "_acc"
		default:
			cookieToken += "_dev"
			cookieUser += "_dev"
		}
		c.Set("cookie_token", cookieToken)
		c.Set("cookie_user", cookieUser)
		// End server.go:97

		return c.GetString(key)
	}

	assert.Equal(t, "token_dev", f("cookie_token", app.EnvEnumDevelopment))
	assert.Equal(t, "token_acc", f("cookie_token", app.EnvEnumAcceptance))
	assert.Equal(t, "token", f("cookie_token", app.EnvEnumProduction))

	assert.Equal(t, "user_uid_dev", f("cookie_user", app.EnvEnumDevelopment))
	assert.Equal(t, "user_uid_acc", f("cookie_user", app.EnvEnumAcceptance))
	assert.Equal(t, "user_uid", f("cookie_user", app.EnvEnumProduction))
}
