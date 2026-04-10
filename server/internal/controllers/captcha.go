package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
	"github.com/the-clothing-loop/website/server/sharedtypes"
)

func CaptchaChallenge(c *gin.Context) {

	challenge, err := app.CaptchaServer.CreateChallenge(c.Request.Context())
	if err != nil {
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Failed to create challenge")
		return
	}

	c.JSON(http.StatusOK, challenge)
}

func CaptchaRedeem(c *gin.Context) {
	var body sharedtypes.CaptchaRedeemRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	result, err := app.CaptchaServer.RedeemChallenge(c.Request.Context(), body.Token, body.Solutions)
	if err != nil {
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Failed to redeem challenge")
		return
	}

	response := sharedtypes.CaptchaRedeemResponse{
		Success: true,
		Token:   result.Token,
		Expires: result.Expires,
	}

	c.JSON(http.StatusOK, response)
}

func captchaValidate(c *gin.Context, token string) (ok bool) {
	if token == "" {
		c.String(http.StatusBadRequest, "Captcha token is required")
		return false
	}

	ok = app.CaptchaServer.ValidateToken(c.Request.Context(), token)

	if !ok {
		c.String(http.StatusBadRequest, "Invalid captcha token")
		return false
	}
	return true
}
