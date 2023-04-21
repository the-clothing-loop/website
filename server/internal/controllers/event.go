package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	ics "github.com/arran4/golang-ical"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/pkg/imgbb"
	"gopkg.in/guregu/null.v3/zero"
)

func EventCreate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Name           string    `json:"name" binding:"required"`
		Description    string    `json:"description"`
		Latitude       float64   `json:"latitude" binding:"required,latitude"`
		Longitude      float64   `json:"longitude" binding:"required,longitude"`
		Address        string    `json:"address" binding:"required"`
		Date           time.Time `json:"date" binding:"required"`
		Genders        []string  `json:"genders" binding:"required"`
		ChainUID       string    `json:"chain_uid,omitempty" binding:"omitempty"`
		ImageUrl       string    `json:"image_url" binding:"required,url"`
		ImageDeleteUrl string    `json:"image_delete_url" binding:"omitempty,url"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	if ok := models.ValidateAllGenderEnum(body.Genders); !ok {
		c.AbortWithError(http.StatusBadRequest, models.ErrGenderInvalid)
		return
	}

	var minimumAuthState int
	if body.ChainUID == "" {
		minimumAuthState = auth.AuthState1AnyUser
	} else {
		minimumAuthState = auth.AuthState3AdminChainUser
	}
	ok, user, chain := auth.Authenticate(c, db, minimumAuthState, body.ChainUID)
	if !ok {
		return
	}

	event := &models.Event{
		UID:            uuid.NewV4().String(),
		Name:           body.Name,
		Description:    body.Description,
		Latitude:       body.Latitude,
		Longitude:      body.Longitude,
		Address:        body.Address,
		Date:           body.Date,
		Genders:        body.Genders,
		UserID:         user.ID,
		ImageUrl:       body.ImageUrl,
		ImageDeleteUrl: body.ImageDeleteUrl,
	}
	if body.ChainUID != "" && chain != nil {
		event.ChainID = zero.NewInt(int64(chain.ID), true)
	}

	if err := db.Create(event).Error; err != nil {
		c.AbortWithError(http.StatusInternalServerError, errors.New("Unable to create event"))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uid": event.UID,
	})
}

func EventGet(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	event := models.Event{}
	sql := models.EventGetSql + `WHERE events.uid = ?`
	err := db.Raw(sql, uri.UID).Scan(&event).Error
	if err != nil {
		c.AbortWithError(http.StatusNotFound, err)
		return
	}

	c.JSON(http.StatusOK, event)
}

func EventGetAll(c *gin.Context) {
	db := getDB(c)

	var query struct {
		Latitude  float32 `form:"latitude" binding:"required,latitude"`
		Longitude float32 `form:"longitude" binding:"required,longitude"`
		Radius    float32 `form:"radius" binding:"required,min=0.001"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	sql := models.EventGetSql + `WHERE date > NOW()`
	args := []any{}
	if query.Latitude != 0 && query.Longitude != 0 && query.Radius != 0 {
		sql = fmt.Sprintf("%s AND %s <= ? ", sql, sqlCalcDistance("events.latitude", "events.longitude", "?", "?"))
		args = append(args, query.Latitude, query.Longitude, query.Radius)
	}
	sql = fmt.Sprintf("%s ORDER BY date ASC", sql)
	events := []models.Event{}
	err := db.Raw(sql, args...).Scan(&events).Error
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, events)
}

// The distance between two longlat points calculated in km.
// Remember to use "?" instead of the actual value in building queries.
func sqlCalcDistance(latA, longA, latB, longB string) string {
	return fmt.Sprintf("(ST_Distance(POINT(%s, %s), POINT(%s, %s))  * 111.195)", latA, longA, latB, longB)
}

func EventDelete(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	ok, _, event := auth.AuthenticateEvent(c, db, uri.UID)
	if !ok {
		return
	}

	// delete image from imgbb
	if event.ImageDeleteUrl != "" {
		imgbb.DeleteAll([]string{event.ImageDeleteUrl})
	}

	err := db.Exec(`DELETE FROM events WHERE id = ?`, event.ID).Error
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func EventUpdate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UID            string     `json:"uid" binding:"required,uuid"`
		Name           *string    `json:"name,omitempty"`
		Description    *string    `json:"description,omitempty"`
		Address        *string    `json:"address,omitempty"`
		Latitude       *float32   `json:"latitude,omitempty" binding:"omitempty,latitude"`
		Longitude      *float32   `json:"longitude,omitempty" binding:"omitempty,longitude"`
		Date           *time.Time `json:"date,omitempty"`
		Genders        *[]string  `json:"genders,omitempty"`
		ImageUrl       *string    `json:"image_url,omitempty"`
		ImageDeleteUrl *string    `json:"image_delete_url,omitempty"`
		ChainUID       *string    `json:"chain_uid,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	if body.Genders != nil {
		if ok := models.ValidateAllGenderEnum(*(body.Genders)); !ok {
			c.AbortWithError(http.StatusBadRequest, models.ErrGenderInvalid)
			return
		}
	}

	ok, user, event := auth.AuthenticateEvent(c, db, body.UID)
	if !ok {
		return
	}

	// authenticate chain uid
	if body.ChainUID != nil {
		err := user.AddUserChainsToObject(db)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		found := false
		for _, uc := range user.Chains {
			if uc.IsChainAdmin && uc.ChainUID == *body.ChainUID {
				found = true
			}
		}
		if !found {
			c.AbortWithError(http.StatusUnauthorized, errors.New("Loop must be "))
			return
		}
	}

	valuesToUpdate := map[string]any{}
	if body.Name != nil {
		valuesToUpdate["name"] = *(body.Name)
	}
	if body.Description != nil {
		valuesToUpdate["description"] = *(body.Description)
	}
	if body.Address != nil {
		valuesToUpdate["address"] = *(body.Address)
	}
	if body.Latitude != nil {
		valuesToUpdate["latitude"] = *(body.Latitude)
	}
	if body.Longitude != nil {
		valuesToUpdate["longitude"] = *(body.Longitude)
	}
	if body.Date != nil {
		valuesToUpdate["date"] = *(body.Date)
	}
	if body.Genders != nil {
		valuesToUpdate["genders"] = *(body.Genders)
	}
	if body.ChainUID != nil {
		valuesToUpdate["chain_uid"] = *(body.ChainUID)
	}
	if body.ImageUrl != nil {
		valuesToUpdate["image_url"] = *(body.ImageUrl)
		if body.ImageDeleteUrl != nil {
			valuesToUpdate["image_delete_url"] = *(body.ImageDeleteUrl)
		}

		if event.ImageDeleteUrl != "" {
			imgbb.DeleteAll([]string{event.ImageDeleteUrl})
		}
	}

	err := db.Model(event).Updates(valuesToUpdate).Error
	if err != nil {
		goscope.Log.Errorf("Unable to update loop values: %v", err)
		c.AbortWithError(http.StatusInternalServerError, errors.New("Unable to update loop values"))
	}
}

func EventICal(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	event := &models.Event{}
	db.Raw("SELECT * FROM events WHERE uid = ? LIMIT 1", uri.UID).Scan(event)
	if event.ID == 0 {
		c.AbortWithError(http.StatusNotFound, fmt.Errorf("Event not found"))
		return
	}

	user := struct {
		Name  string      `gorm:"name"`
		Email zero.String `gorm:"email"`
	}{}
	db.Raw(`
SELECT name, email
FROM users
WHERE id = ?
LIMIT 1
	`, event.UserID).Scan(&user)

	cal := ics.NewCalendar()
	cal.SetMethod(ics.MethodRequest)
	icalE := cal.AddEvent(event.UID)
	icalE.SetCreatedTime(event.CreatedAt)
	icalE.SetModifiedAt(event.UpdatedAt)
	icalE.SetStartAt(event.Date)
	icalE.SetEndAt(event.Date.Add(time.Duration(2) * time.Hour))
	icalE.SetSummary(event.Name)
	icalE.SetLocation(fmt.Sprintf("https://www.google.com/maps/@%v,%v,17z", event.Latitude, event.Longitude))
	icalE.SetDescription(event.Description)
	icalE.SetURL(fmt.Sprintf("%s/events/%s", app.Config.SITE_BASE_URL_FE, uri.UID))
	if user.Email.Valid {
		icalE.SetOrganizer(user.Email.String, ics.WithCN(user.Name))
	}

	c.String(http.StatusOK, cal.Serialize())
}
