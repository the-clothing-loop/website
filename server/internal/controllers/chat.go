package controllers

import (
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/services"
	ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gorm.io/gorm"
)

func ChatGetType(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatGetTypeRequest
	if err := c.BindQuery(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	chatTypeUrl, err := chain.GetChatType(db)
	if err != nil {
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Unable to find chat type")
		return
	}

	c.JSON(http.StatusOK, chatTypeUrl)
}

func ChatPatchType(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatPatchTypeRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	err := chain.SaveChatType(db, sharedtypes.ChatGetTypeResponse{
		ChatType:          body.ChatType,
		ChatUrl:           body.ChatUrl,
		ChatInAppDisabled: body.ChatInAppDisabled,
	})
	if err != nil {
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Unable to find chat type")
		return
	}

	c.Status(http.StatusOK)
}

func ChatChannelList(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatChannelListQuery
	if err := c.ShouldBindQuery(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	chatChannelList := []sharedtypes.ChatChannel{}
	err := db.Raw(`SELECT * FROM chat_channels WHERE chain_id = ?`, chain.ID).Scan(&chatChannelList).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	for i := range chatChannelList {
		chatChannelList[i].ChainUID = chain.UID
	}

	c.JSON(http.StatusOK, sharedtypes.ChatChannelListResponse{List: chatChannelList})
}

func ChatChannelCreate(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatChannel
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	body.ChainID = chain.ID
	body.CreatedAt = time.Now().UnixMilli()
	body.ID = 0
	body.ChatMessages = nil
	err := db.Save(&body).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.Status(http.StatusOK)
}

func ChatChannelEdit(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatChannelEditRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	err := db.Exec(`UPDATE chat_channels SET name = ?, color = ? WHERE id = ? AND chain_id = ?`, body.Name, body.Color, body.ID, chain.ID).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.Status(http.StatusOK)
}

func ChatChannelDelete(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatChannelDeleteQuery
	if err := c.ShouldBindQuery(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	ok = isChatPartOfChain(c, db, chain.ID, body.ChatChannelID)
	if !ok {
		return
	}

	err := func() (err error) {
		tx := db.Begin()

		err = tx.Exec("DELETE FROM chat_messages WHERE chat_channel_id = ?", body.ChatChannelID).Error
		if err != nil {
			tx.Rollback()
			return err
		}

		err = tx.Exec("DELETE FROM chat_channels WHERE id = ?", body.ChatChannelID).Error
		if err != nil {
			tx.Rollback()
			return err
		}

		return tx.Commit().Error
	}()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.Status(http.StatusOK)
}

func ChatChannelMessageList(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatChannelMessageListQuery
	if err := c.ShouldBindQuery(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	chatChannelMessageList := []sharedtypes.ChatMessage{}
	var err error
	if body.Page >= 0 {
		err = db.Debug().Raw(`
SELECT msg.* FROM chat_messages msg
JOIN chat_channels channel ON channel.id = msg.chat_channel_id AND channel.id = ? AND channel.chain_id = ?
WHERE msg.created_at <= ?
ORDER BY msg.created_at DESC
LIMIT ?, 20
		`, body.ChatChannelID, chain.ID, body.StartFrom, body.Page*20).Scan(&chatChannelMessageList).Error
	} else {
		err = db.Debug().Raw(`
SELECT msg.* FROM chat_messages msg
JOIN chat_channels channel ON channel.id = msg.chat_channel_id AND channel.id = ? AND channel.chain_id = ?
WHERE msg.created_at > ?
ORDER BY msg.created_at ASC
LIMIT ?, 20
		`, body.ChatChannelID, chain.ID, body.StartFrom, ((-body.Page)-1)*20).Scan(&chatChannelMessageList).Error
		slices.Reverse(chatChannelMessageList)
	}
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	for i, v := range chatChannelMessageList {
		if v.DeletedAt != nil {
			chatChannelMessageList[i].Message = "__DELETED__"
		}
	}

	c.JSON(http.StatusOK, sharedtypes.ChatChannelMessageListResponse{Messages: chatChannelMessageList})
}

func ChatChannelMessagePinToggle(c *gin.Context) {
	ok, db, _, _, _, message := chatGenericAlterMessage(c, binding.JSON, auth.AuthState3AdminChainUser)
	if !ok {
		return
	}

	err := db.Exec("UPDATE chat_messages SET is_pinned = ? WHERE id = ?", !message.IsPinned, message.ID).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
}

func ChatChannelMessageDelete(c *gin.Context) {
	ok, db, _, _, _, message := chatGenericAlterMessage(c, binding.Query, auth.AuthState2UserOfChain)
	if !ok {
		return
	}

	err := db.Exec("UPDATE chat_messages SET deleted_at = NOW(), is_pinned = FALSE WHERE id = ?", message.ID).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
}

func ChatChannelMessageCreate(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatMessageCreateRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, authUser, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	ok = isChatPartOfChain(c, db, chain.ID, body.ChatChannelID)
	if !ok {
		return
	}

	err := services.ChatSendMessage(db, services.ChatSendMessageOptions{
		Message:        body.Message,
		SendByUID:      authUser.UID,
		ChatChannelID:  body.ChatChannelID,
		NotifyUserUIDs: body.NotifyUserUIDs,
	})
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.Status(http.StatusOK)
}

func isChatPartOfChain(c *gin.Context, db *gorm.DB, chainID, channelID uint) (ok bool) {
	count := int64(-1)
	db.Raw(`SELECT COUNT(*) FROM chat_channels WHERE id = ? AND chain_id = ? LIMIT 1`, channelID, chainID).Count(&count)
	if count <= 0 {
		c.String(http.StatusBadRequest, fmt.Sprintf("chat room %d is not part of this Loop", channelID))
		return false
	}
	return true
}

func chatGenericAlterMessage(c *gin.Context, bindingType binding.Binding, minimumAuthState int) (ok bool, db *gorm.DB, authUser *models.User, chain *models.Chain, channelID uint, message *sharedtypes.ChatMessage) {
	db = getDB(c)
	var body sharedtypes.ChatMessageRequest
	if err := c.ShouldBindWith(&body, bindingType); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, authUser, chain = auth.Authenticate(c, db, minimumAuthState, body.ChainUID)
	if !ok {
		return
	}

	ok = isChatPartOfChain(c, db, chain.ID, body.ChatChannelID)
	if !ok {
		return
	}

	message, err := models.ChatMessageGet(db, body.ChatMessageID, body.ChatChannelID)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	if minimumAuthState < auth.AuthState3AdminChainUser {
		if message.SendByUID != authUser.UID {
			_, isChainAdmin := authUser.IsPartOfChain(chain.UID)
			if !isChainAdmin {
				c.String(http.StatusBadRequest, "Insufficient privileges on selected message")
				return
			}
		}
	}

	return true, db, authUser, chain, channelID, message
}
