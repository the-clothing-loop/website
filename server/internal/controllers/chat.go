package controllers

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/OneSignal/onesignal-go-api"
	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/views"
	ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
	"github.com/the-clothing-loop/website/server/sharedtypes"
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
		ChatType: body.ChatType,
		ChatUrl:  body.ChatUrl,
	})
	if err != nil {
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Unable to find chat type")
		return
	}

	c.Status(http.StatusOK)
}

func ChatRoomList(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatRoomListQuery
	if err := c.ShouldBindQuery(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	chatRoomList := []sharedtypes.ChatRoom{}
	err := db.Raw(`SELECT * FROM chat_rooms WHERE chain_id = ?`, chain.ID).Scan(&chatRoomList).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, sharedtypes.ChatRoomListResponse{List: chatRoomList})
}

func ChatRoomCreate(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatRoom
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

func ChatRoomEdit(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatRoomEditRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState3AdminChainUser, body.ChainUID)
	if !ok {
		return
	}

	err := db.Exec(`UPDATE chat_rooms SET name = ?, color = ? WHERE id = ? AND chain_id = ?`, body.Name, body.Color, body.ID, chain.ID).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.Status(http.StatusOK)
}

func ChatRoomMessageList(c *gin.Context) {
	db := getDB(c)
	var body sharedtypes.ChatRoomMessageListQuery
	if err := c.ShouldBindQuery(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, chain := auth.Authenticate(c, db, auth.AuthState2UserOfChain, body.ChainUID)
	if !ok {
		return
	}

	chatRoomMessageList := []sharedtypes.ChatMessage{}
	err := db.Debug().Raw(`
SELECT msg.* FROM chat_messages msg
LEFT JOIN chat_rooms room ON room.id = msg.chat_room_id AND room.id = ? AND room.chain_id = ?
WHERE msg.created_at < ?
LIMIT ?, 20 
`, body.ChatRoomID, chain.ID, body.StartFrom, body.Page*20).Scan(&chatRoomMessageList).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, sharedtypes.ChatRoomMessageListResponse{Messages: chatRoomMessageList})
}

func ChatRoomMessageCreate(c *gin.Context) {
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

	count := int64(-1)
	db.Raw(`SELECT COUNT(*) FROM chat_rooms WHERE id = ? AND chain_id = ?`, body.ChatRoomID, chain.ID).Count(&count)
	if count <= 0 {
		c.String(http.StatusBadRequest, fmt.Sprintf("chat room %d is not part of this Loop", body.ChatRoomID))
		return
	}

	chatMessage := sharedtypes.ChatMessage{
		Message:    body.Message,
		SendByUID:  authUser.UID,
		ChatRoomID: body.ChatRoomID,
		CreatedAt:  time.Now().UnixMilli(),
	}
	err := db.Save(&chatMessage).Error
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	// send message to one signal
	userUIDs, err := models.UserGetAllApprovedUserUIDsByChain(db, chain.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	notificationMessage := lo.Ellipsis(body.Message, 10)
	err = app.OneSignalCreateNotification(db, userUIDs, *views.Notifications[views.NotificationEnumTitleChatMessage], onesignal.StringMap{
		En: &notificationMessage,
	})
	if err != nil {
		slog.Error("Unable to send notification", "err", err)
	}

	c.Status(http.StatusOK)
}
