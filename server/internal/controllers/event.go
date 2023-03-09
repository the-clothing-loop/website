package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	"github.com/CollActionteam/clothing-loop/server/internal/app/auth"
	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	glog "github.com/airbrake/glog/v4"
	ics "github.com/arran4/golang-ical"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gopkg.in/guregu/null.v3/zero"
)

type EventCreateRequestBody struct {
	Name        string    `json:"name" binding:"required"`
	Description string    `json:"description"`
	Latitude    float64   `json:"latitude" binding:"required,latitude"`
	Longitude   float64   `json:"longitude" binding:"required,longitude"`
	Address     string    `json:"address" binding:"required"`
	Date        time.Time `json:"date" binding:"required"`
	Genders     []string  `json:"genders" binding:"required"`
	ChainUID    string    `json:"chain_uid,omitempty" binding:"omitempty"`
}

func EventCreate(c *gin.Context) {
	db := getDB(c)

	var body EventCreateRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}
	if ok := models.ValidateAllGenderEnum(body.Genders); !ok {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrGenderInvalid)
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
		UID:         uuid.NewV4().String(),
		Name:        body.Name,
		Description: body.Description,
		Latitude:    body.Latitude,
		Longitude:   body.Longitude,
		Address:     body.Address,
		Date:        body.Date,
		Genders:     body.Genders,
		UserEvents:  []models.UserEvent{{UserID: user.ID}},
	}
	if body.ChainUID != "" && chain != nil {
		event.ChainID = zero.NewInt(int64(chain.ID), true)
	}

	if err := db.Create(event).Error; err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to create event"))
		return
	}
}

func EventGet(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	event, err := models.EventFindByUID(db, uri.UID)
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusNotFound, err)
		return
	}

	c.JSON(http.StatusOK, event.ResponseBody(db))
}

func EventDelete(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	ok, _, event := auth.AuthenticateEvent(c, db, uri.UID)
	if !ok {
		return
	}

	err := db.Exec(`DELETE FROM events WHERE id = ?`, event.ID).Error
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, err)
		return
	}
}

func EventUpdate(c *gin.Context) {
	db := getDB(c)

	var body struct {
		UID         string     `json:"uid" binding:"required,uuid"`
		Name        *string    `json:"name,omitempty"`
		Description *string    `json:"description,omitempty"`
		Address     *string    `json:"address,omitempty"`
		Latitude    *float32   `json:"latitude,omitempty" binding:"omitempty,latitude"`
		Longitude   *float32   `json:"longitude,omitempty" binding:"omitempty,longitude"`
		Date        *time.Time `json:"date,omitempty"`
		Genders     *[]string  `json:"genders,omitempty"`
		ChainUID    *string    `json:"chain_uid,omitempty"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}
	if body.Genders != nil {
		if ok := models.ValidateAllGenderEnum(*(body.Genders)); !ok {
			gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, models.ErrGenderInvalid)
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
			gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, err)
			return
		}

		found := false
		for _, uc := range user.Chains {
			if uc.IsChainAdmin && uc.ChainUID == *body.ChainUID {
				found = true
			}
		}
		if !found {
			gin_utils.GinAbortWithErrorBody(c, http.StatusUnauthorized, errors.New("Loop must be "))
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

	err := db.Model(event).Updates(valuesToUpdate).Error
	if err != nil {
		glog.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to update loop values"))
	}
}

func EventICal(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	event := &models.Event{}
	db.Raw("SELECT * FROM events WHERE uid = ? LIMIT 1", uri.UID).Scan(event)
	if event.ID == 0 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusNotFound, fmt.Errorf("Event not found"))
		return
	}

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
	icalE.SetOrganizer("sender@domain", ics.WithCN("This Machine"))

	c.String(http.StatusOK, cal.Serialize())
}
