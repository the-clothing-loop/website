package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/services"
)

func ChatPatchUserPassword(c *gin.Context) {
	db := getDB(c)

	ok, user, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	err := services.ChatPatchUser(db, c.Request.Context(), user)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	// if !user.ChatPass.Valid {
	// 	p, _ := atoll.NewPassword(16, []atoll.Level{atoll.Digit, atoll.Lower, atoll.Upper})
	// 	password := string(p)

	// 	user.ChatPass = null.StringFrom(password)
	// 	db.Exec(`UPDATE users SET chat_pass = ? WHERE id = ?`,
	// 		user.ChatPass.String,
	// 		user.ID)
	// }

	// if user.ChatPass.String == "" {
	// 	c.AbortWithError(http.StatusTeapot, fmt.Errorf("password is not set"))
	// 	return
	// }

	json := gin.H{
		"chat_user_id": user.ChatUserID,
		"chat_pass":    user.ChatPass.String,
	}
	c.JSON(http.StatusOK, json)
}

func ChatCreateGroup(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID  string `json:"chain_uid" binding:"required,uuid"`
		ChannelID string `json:"group_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	err := services.ChatCreateChannel(db, chain, body.ChannelID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func ChatDeleteChannel(c *gin.Context) {
	db := getDB(c)

	var body struct {
		ChainUID  string `json:"chain_uid" binding:"required,uuid"`
		ChannelID string `json:"group_id" binding:"required"`
	}
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

// func ChatJoinChannels(c *gin.Context) {
// 	db := getDB(c)

// 	var body struct {
// 		ChainUID    string `json:"chain_uid" binding:"required,uuid"`
// 		ChatGroupID string `json:"chat_group_id" binding:"required"`
// 	}
// 	if err := c.ShouldBindJSON(&body); err != nil {
// 		c.AbortWithError(http.StatusBadRequest, err)
// 		return
// 	}

// 	ok, user, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
// 	if !ok {
// 		return
// 	}

// 	_, isChainAdmin := user.IsPartOfChain(chain.UID)
// 	if !isChainAdmin && len(chain.ChatRoomIDs) == 0 {
// 		c.String(http.StatusExpectationFailed, "The Loop host must first enable chat")
// 		return
// 	}

// 	for _, mmChannelId := range chain.ChatRoomIDs {
// 		err := services.ChatJoinChannel(db, c.Request.Context(), chain, user, isChainAdmin, mmChannelId)
// 		if err != nil {
// 			httperror.New(http.StatusInternalServerError, err).StatusWithError(c)
// 			return
// 		}
// 	}
// }
