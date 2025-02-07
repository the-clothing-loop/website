package controllers

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	ics "github.com/arran4/golang-ical"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/pkg/imgbb"
	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gopkg.in/guregu/null.v3/zero"
)

func EventCreate(c *gin.Context) {
	db := getDB(c)

	var body sharedtypes.EventCreateRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
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
		Link:           body.Link,
		Date:           body.Date,
		DateEnd:        body.DateEnd,
		Genders:        body.Genders,
		UserID:         user.ID,
		ImageUrl:       body.ImageUrl,
		ImageDeleteUrl: body.ImageDeleteUrl,
		PriceType:      &body.PriceType,
	}
	event.ValidateDescription()
	if body.ChainUID != "" && chain != nil {
		event.ChainID = &chain.ID
	}
	if body.PriceCurrency != "" {
		event.PriceValue = body.PriceValue
		event.PriceCurrency = &body.PriceCurrency
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
		c.String(http.StatusBadRequest, err.Error())
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
		Radius    float32 `form:"radius"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	if query.Radius == 5000 {
		query.Radius = 0
	}

	sql := models.EventGetSql + `WHERE (date > NOW() OR (date_end IS NOT NULL AND date_end > NOW()))`
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

func EventGetPrevious(c *gin.Context) {
	db := getDB(c)

	var query struct {
		Latitude     float32 `form:"latitude" binding:"required,latitude"`
		Longitude    float32 `form:"longitude" binding:"required,longitude"`
		Radius       float32 `form:"radius"`
		IncludeTotal bool    `form:"include_total"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	if query.Radius == 5000 {
		query.Radius = 0
	}

	sql := models.EventGetSql + `WHERE date < NOW()`
	args := []any{}
	if query.Latitude != 0 && query.Longitude != 0 && query.Radius != 0 {
		sql = fmt.Sprintf("%s AND %s <= ? ", sql, sqlCalcDistance("events.latitude", "events.longitude", "?", "?"))
		args = append(args, query.Latitude, query.Longitude, query.Radius)
	}
	sql = fmt.Sprintf("%s ORDER BY date DESC LIMIT 6", sql)
	events := []models.Event{}
	err := db.Raw(sql, args...).Scan(&events).Error
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	res := gin.H{
		"previous_events": events,
	}
	if query.IncludeTotal {
		total := 0
		err = db.Raw(`SELECT COUNT(*) FROM events WHERE date < NOW()`).Scan(&total).Error
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		res["previous_total"] = total
	}
	c.JSON(http.StatusOK, res)
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
		c.String(http.StatusBadRequest, err.Error())
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

	var body sharedtypes.EventUpdateRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	if body.Genders != nil {
		if ok := models.ValidateAllGenderEnum(*body.Genders); !ok {
			c.AbortWithError(http.StatusBadRequest, models.ErrGenderInvalid)
			return
		}
	}

	ok, user, event := auth.AuthenticateEvent(c, db, body.UID)
	if !ok {
		return
	}

	// authenticate chain uid
	var chainID uint
	if body.ChainUID != nil {
		err := user.AddUserChainsToObject(db)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if *body.ChainUID != "" && !user.IsRootAdmin {
			found := false
			for _, uc := range user.Chains {
				if uc.ChainUID == *body.ChainUID {
					chainID = uc.ChainID
					found = true
				}
			}
			if !found {
				c.AbortWithError(http.StatusUnauthorized, errors.New("User does not belong to this loop"))
				return
			}
		}
	}

	if body.Name != nil {
		event.Name = *(body.Name)
	}
	if body.Description != nil {
		event.Description = *(body.Description)
		event.ValidateDescription()
	}
	if body.Link != nil {
		event.Link = *(body.Link)
	}
	if body.Address != nil {
		event.Address = *(body.Address)
	}
	if body.Latitude != nil {
		event.Latitude = *(body.Latitude)
	}
	if body.Longitude != nil {
		event.Longitude = *(body.Longitude)
	}
	if body.Date != nil {
		event.Date = *(body.Date)
		// Must set the start date to set the end date
		if body.DateEnd != nil {
			event.DateEnd = body.DateEnd
		} else {
			event.DateEnd = nil
		}
	}
	if body.Genders != nil {
		event.Genders = *(body.Genders)
	}
	if chainID != 0 {
		event.ChainID = &chainID
	}
	if body.ImageUrl != nil {
		event.ImageUrl = *body.ImageUrl
		if event.ImageUrl != *body.ImageUrl && event.ImageDeleteUrl != "" {
			imgbb.DeleteAll([]string{event.ImageDeleteUrl})
		}
		if body.ImageDeleteUrl != nil {
			event.ImageDeleteUrl = *(body.ImageDeleteUrl)
		}
	}
	if body.PriceType != nil {
		event.PriceType = body.PriceType
	}
	if body.PriceCurrency != nil && body.PriceValue != nil {
		if *body.PriceCurrency == "" {
			event.PriceCurrency = nil
			event.PriceValue = 0
		} else {
			event.PriceCurrency = body.PriceCurrency
			event.PriceValue = *body.PriceValue
		}
	}

	err := db.Save(event).Error
	if err != nil {
		slog.Error("Unable to update loop values", "err", err)
		c.AbortWithError(http.StatusInternalServerError, errors.New("Unable to update loop values"))
		return
	}
}

func EventICal(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		c.String(http.StatusBadRequest, err.Error())
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
	if event.DateEnd != nil {
		icalE.SetEndAt(*event.DateEnd)
	} else {
		icalE.SetEndAt(event.Date.Add(time.Duration(2) * time.Hour))
	}
	icalE.SetSummary(event.Name)
	icalE.SetLocation(fmt.Sprintf("https://www.google.com/maps/@%v,%v,17z", event.Latitude, event.Longitude))
	icalE.SetDescription(event.Description)
	icalE.SetURL(fmt.Sprintf("%s/events/%s", app.Config.SITE_BASE_URL_FE, uri.UID))
	if user.Email.Valid {
		icalE.SetOrganizer(user.Email.String, ics.WithCN(user.Name))
	}

	c.Data(http.StatusOK, "text/calendar", []byte(cal.Serialize()))
}
