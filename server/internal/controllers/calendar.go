package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	ics "github.com/arran4/golang-ical"
	"github.com/gin-gonic/gin"
)

func CalendarICal(c *gin.Context) {
	db := getDB(c)

	var uri struct {
		UID string `uri:"uid" binding:"required,uuid"`
	}
	if err := c.ShouldBindUri(&uri); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, err)
		return
	}

	calendar := &models.Calendar{}
	db.Raw("SELECT * FROM calendars WHERE uid = ? LIMIT 1", uri.UID).Scan(calendar)
	if calendar.ID == 0 {
		gin_utils.GinAbortWithErrorBody(c, http.StatusNotFound, fmt.Errorf("Calendar not found"))
		return
	}

	cal := ics.NewCalendar()
	cal.SetMethod(ics.MethodRequest)
	event := cal.AddEvent(calendar.UID)
	event.SetCreatedTime(calendar.CreatedAt)
	event.SetModifiedAt(calendar.UpdatedAt)
	event.SetStartAt(calendar.Date)
	event.SetEndAt(calendar.Date.Add(time.Duration(2) * time.Hour))
	event.SetSummary(calendar.Name)
	event.SetLocation(fmt.Sprintf("https://www.google.com/maps/@%v,%v,17z", calendar.Latitude, calendar.Longitude))
	event.SetDescription(calendar.Description)
	event.SetURL("https://URL/")
	event.SetOrganizer("sender@domain", ics.WithCN("This Machine"))

	c.String(http.StatusOK, cal.Serialize())
}
