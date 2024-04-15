package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/services"
	"github.com/the-clothing-loop/website/server/pkg/httperror"
)

func ChatGetOrJoinChainChatRoom(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	var query struct {
		RenewToken bool `form:"renew_token,omitempty"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	ok, user, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, uri.UID)
	if !ok {
		return
	}
	_, isChainAdmin := user.IsPartOfChain(chain.UID)
	if !isChainAdmin && !chain.ChatRoomID.Valid {
		c.String(http.StatusExpectationFailed, "The Loop host must first enable chat")
		return
	}

	token, err := services.ChatPatchUser(db, c.Request.Context(), app.ChatTeamId, user, query.RenewToken)
	if err != nil {
		httperror.New(http.StatusInternalServerError, err).StatusWithError(c)
		return
	}
	if token == "" && query.RenewToken {
		c.AbortWithError(http.StatusTeapot, fmt.Errorf("token is not set"))
		return
	}

	_, err = services.ChatJoinRoom(db, c.Request.Context(), chain, user, isChainAdmin)
	if err != nil {
		httperror.New(http.StatusInternalServerError, err).StatusWithError(c)
		return
	}

	json := gin.H{
		"chat_team":    app.ChatTeamId,
		"chat_channel": chain.ChatRoomID.String,
		"chat_user":    user.ChatUserID.String,
	}
	if token != "" {
		json["chat_token"] = token
	}
	c.JSON(http.StatusOK, json)
}
