package controllers

import (
	"fmt"
	"net/http"

	"github.com/OneSignal/onesignal-go-api"
	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gorm.io/gorm"
)

func oneSignalCreateNotification(c *gin.Context, db *gorm.DB, playerIDs []string, notificationTitle, notificationSubtitle *onesignal.StringMap) bool {
	if len(playerIDs) == 0 {
		c.AbortWithError(http.StatusNoContent, fmt.Errorf("No connected app users found"))
		return false
	}

	headings := onesignal.NullableStringMap{}
	subtle := onesignal.NullableStringMap{}
	if notificationTitle != nil {
		headings.Set(notificationTitle)
		if notificationSubtitle != nil {
			subtle.Set(notificationSubtitle)
		}
	}

	auth := app.OneSignalGetAuth()
	_, _, err := app.OneSignalClient.DefaultApi.CreateNotification(auth).Notification(onesignal.Notification{
		Headings:         headings,
		Subtitle:         subtle,
		IncludePlayerIds: playerIDs,
	}).Execute()
	if err != nil {
		c.AbortWithError(http.StatusServiceUnavailable, err)
		return false
	}
	return true
}

func OneSignalPlayerPut(c *gin.Context) {
	var body struct {
		PlayerID    string `json:"player_id"`
		OnesignalID string `json:"onesignal_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	db := getDB(c)

	ok, authUser, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	err := models.UserOnesignalPut(db, authUser.ID, body.OnesignalID, body.PlayerID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func OneSignalPlayerDelete(c *gin.Context) {
	var body struct {
		PlayerID string `uri:"player_id"`
	}
	if err := c.ShouldBindUri(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	db := getDB(c)

	ok, _, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	err := models.UserOnesignalDelete(db, body.PlayerID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}
