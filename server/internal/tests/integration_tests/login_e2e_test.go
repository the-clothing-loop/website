//go:build !ci

package integration_tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestLoginAppStoreReviewer(t *testing.T) {
	var token string
	t.Run("Login email", func(t *testing.T) {
		email := app.Config.APPSTORE_REVIEWER_EMAIL
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, "/v2/login/email", &gin.H{
			"app":   true,
			"email": email,
		}, "")

		controllers.LoginEmail(c)

		result := resultFunc()
		token = result.Body

		assert.Equal(t, http.StatusOK, result.Response.StatusCode, result)
		assert.NotEmpty(t, token)
	})

	t.Run("Validate token", func(t *testing.T) {
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, fmt.Sprintf("/v2/login/validate?apiKey=%s", token), nil, token)
		controllers.LoginValidate(c)
		result := resultFunc()
		assert.Equal(t, http.StatusOK, result.Response.StatusCode, result)
	})
}
