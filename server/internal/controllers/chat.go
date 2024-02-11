package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/services"
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

	ok, user, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, uri.UID)
	if !ok {
		return
	}
	_, isChainAdmin := user.IsPartOfChain(chain.UID)
	if !isChainAdmin && !chain.ChatRoomID.Valid {
		c.String(http.StatusExpectationFailed, "The Loop host must first enable chat")
		return
	}

	_, _, err := services.ChatPatchUser(db, app.ChatTeamId, user)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	_, err = services.ChatJoinRoom(db, chain, user, isChainAdmin)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"chat_user": user.ChatUserID.String,
		"chat_pass": user.ChatPass.String,
		"chat_room": chain.ChatRoomID.String,
	})
}
