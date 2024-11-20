package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/services"
	"github.com/the-clothing-loop/website/server/pkg/httperror"
	"github.com/the-clothing-loop/website/server/sharedtypes"
)

func ChatPatchUser(c *gin.Context) {
	db := getDB(c)

	var body sharedtypes.ChatPatchUserRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ok, user, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	err := services.ChatPatchUser(db, c.Request.Context(), app.ChatTeamId, user)
	if err != nil {
		httperror.New(http.StatusInternalServerError, err).StatusWithError(c)
		return
	}
	if user.ChatPass == nil {
		c.AbortWithError(http.StatusTeapot, fmt.Errorf("password is not set"))
		return
	}

	// Create a new channel if none exists
	if len(chain.ChatRoomIDs) == 0 {
		_, isChainAdmin := user.IsPartOfChain(chain.UID)
		if isChainAdmin {
			_, err := services.ChatCreateChannel(db, c.Request.Context(), chain, *user.ChatUserID, "General", "#fff")
			if err != nil {
				c.String(http.StatusInternalServerError, err.Error())
				return
			}
		}
	}

	c.JSON(http.StatusOK, sharedtypes.ChatPatchUserResponse{
		ChatTeam:     app.ChatTeamId,
		ChatUserID:   *user.ChatUserID,
		ChatPass:     *user.ChatPass,
		ChatUserName: *user.ChatUserName,
	})
}

func ChatCreateChannel(c *gin.Context) {
	db := getDB(c)

	var body sharedtypes.ChatCreateChannelRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ok, user, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	mmChannel, err := services.ChatCreateChannel(db, c.Request.Context(), chain, *user.ChatUserID, body.Name, body.Color)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, sharedtypes.ChatCreateChannelResponse{
		ChatChannel: mmChannel.Id,
	})
}

func ChatDeleteChannel(c *gin.Context) {
	db := getDB(c)

	var body sharedtypes.ChatDeleteChannelRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	err := services.ChatDeleteChannel(db, c.Request.Context(), chain, body.ChannelID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func ChatJoinChannels(c *gin.Context) {
	db := getDB(c)

	var body sharedtypes.ChatJoinChannelsRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ok, user, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	_, isChainAdmin := user.IsPartOfChain(chain.UID)
	if chain.IsAppDisabled && !isChainAdmin {
		c.String(http.StatusExpectationFailed, "The Loop host must first enable chat")
		return
	}

	for _, mmChannelId := range chain.ChatRoomIDs {
		err := services.ChatJoinChannel(db, c.Request.Context(), chain, user, isChainAdmin, mmChannelId)
		if err != nil {
			httperror.New(http.StatusInternalServerError, err).StatusWithError(c)
			return
		}
	}
}
