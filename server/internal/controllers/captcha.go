package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	capserver "github.com/samwafgo/cap_go_server"
	"github.com/the-clothing-loop/website/server/internal/app"
	ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
	"github.com/the-clothing-loop/website/server/sharedtypes"
)

func CaptchaChallenge(c *gin.Context) {
	config := &capserver.ChallengeConfig{
		ChallengeCount:      50,
		ChallengeSize:       32,
		ChallengeDifficulty: 4,
		ExpiresMs:           300000,
		Store:               true,
	}

	challenge, err := app.CaptchaServer.CreateChallenge(config)
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

	// Create solution structure with [salt, target, solution] format
	solution := &capserver.Solution{
		Token:     body.Token,
		Solutions: body.Solutions,
	}

	result, err := app.CaptchaServer.RedeemChallenge(solution)
	if err != nil {
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Failed to redeem challenge")
		return
	}

	response := sharedtypes.CaptchaRedeemResponse{
		Success: result.Success,
	}

	if result.Success && result.Token != "" {
		response.Token = result.Token
	}
	if result.Success && result.Expires > 0 {
		response.Expires = result.Expires
	}
	c.JSON(http.StatusOK, response)
}

func captchaValidate(c *gin.Context, token string) (ok bool) {
	if token == "" {
		c.String(http.StatusBadRequest, "Captcha token is required")
		return false
	}

	result, err := app.CaptchaServer.ValidateToken(token, nil)
	if err != nil {
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Failed to validate captcha token")
		return false
	}

	if !result.Success {
		c.String(http.StatusBadRequest, "Invalid captcha token")
		return false
	}
	return true
}
