package app

import (
	"context"
	"fmt"

	lib "github.com/getbrevo/brevo-go/lib"
	"github.com/gin-gonic/gin"
)

var Brevo *brevo

type brevo struct {
	client *lib.APIClient
}

func BrevoInit() {
	cfg := lib.NewConfiguration()
	cfg.AddDefaultHeader("api-key", Config.SENDINBLUE_API_KEY)
	Brevo = &brevo{lib.NewAPIClient(cfg)}
}

func (b *brevo) CreateContact(ctx context.Context, email string) error {
	var params = lib.CreateContact{Email: email}

	obj, resp, err := b.client.ContactsApi.CreateContact(ctx, params)
	if err != nil {
		fmt.Println("Error in ContactsApi->CreateContact", err.Error())
		return err
	}
	fmt.Println("CreateContact Object:", obj, " CreateContact Response: ", resp)
	return nil
}

func (b *brevo) ExistsContact(ctx context.Context, email string) error {
	obj, resp, err := b.client.ContactsApi.GetContactStats(ctx, email, nil)
	if err != nil {
		fmt.Println("Error in ContactsApi->GetContactStats", err.Error())
		return err
	}
	fmt.Println("CreateContact Object:", obj, " CreateContact Response: ", resp)
	return nil
}

func (b *brevo) DeleteContact(ctx context.Context, email string) error {
	resp, err := b.client.ContactsApi.DeleteContact(ctx, email)
	if err != nil {
		fmt.Println("Error in ContactsApi->DeleteContact", err.Error())
		return err
	}
	fmt.Println("DeleteContact Response: ", resp)
	return nil
}

type webhookUnsubscribeResponse struct {
	Event        string `json:"event" binding:"required,eq=unsubscribe"` // "unsubscribe"
	Email        string `json:"email" binding:"email,required"`          //	recipient email
	ID           uint   `json:"id"`                                      //	internal id of webhook
	DateSent     string `json:"date_sent"`                               //	date the campaign was sent (year-month-day, hour:minute:second)
	DateEvent    string `json:"date_event"`                              //	date the event occurred (year-month-day, hour:minute:second)
	TsSent       int64  `json:"ts_sent"`                                 //	timestamp in seconds of when campaign was sent
	TsEvent      int64  `json:"ts_event"`                                //	timestamp in seconds of when event occurred
	CampId       uint   `json:"camp_id"`                                 //	internal id of campaign
	CampaignName string `json:"campaign name"`                           //	string	internal name of campaign
	ListId       []uint `json:"list_id"`                                 // array of integers	the internal list id's the recipient has been unsubscribed from
	Ts           int64  `json:"ts"`                                      //	timestamp in seconds of when event occurred
	Tag          string `json:"tag"`                                     // internal tag of campaign
}

func (sib *brevo) WebhookUnsubscribed(c *gin.Context) (email string, err error) {
	var body *webhookUnsubscribeResponse
	if err = c.BindJSON(body); err != nil {
		return "", err
	}

	return body.Email, nil
}
