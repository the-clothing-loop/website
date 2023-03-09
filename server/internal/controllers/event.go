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
	//TODO
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
