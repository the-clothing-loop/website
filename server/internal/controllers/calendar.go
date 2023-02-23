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
	event := cal.AddEvent(fmt.Sprintf("id@domain", p.SessionKey.IntID()))
	event.SetCreatedTime(time.Now())
	event.SetDtStampTime(time.Now())
	event.SetModifiedAt(time.Now())
	event.SetStartAt(time.Now())
	event.SetEndAt(time.Now())
	event.SetSummary("Summary")
	event.SetLocation("Address")
	event.SetDescription("Description")
	event.SetURL("https://URL/")
	event.AddRrule(fmt.Sprintf("FREQ=YEARLY;BYMONTH=%d;BYMONTHDAY=%d", time.Now().Month(), time.Now().Day()))
	event.SetOrganizer("sender@domain", ics.WithCN("This Machine"))
	event.AddAttendee("reciever or participant", ics.CalendarUserTypeIndividual, ics.ParticipationStatusNeedsAction, ics.ParticipationRoleReqParticipant, ics.WithRSVP(true))

	c.String(http.StatusOK, cal.Serialize())
}
