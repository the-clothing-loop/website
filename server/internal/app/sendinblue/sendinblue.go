package sendinblue

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
	lib "github.com/sendinblue/APIv3-go-library/v2/lib"
)

type SendInBlue struct{ *lib.APIClient }

func Init(apiKey string) *SendInBlue {
	cfg := lib.NewConfiguration()
	cfg.AddDefaultHeader("api-key", apiKey)
	return &SendInBlue{lib.NewAPIClient(cfg)}

}

func (sib *SendInBlue) CreateContact(ctx context.Context, email string) error {
	var params = lib.CreateContact{Email: email}

	obj, resp, err := sib.ContactsApi.CreateContact(ctx, params)
	if err != nil {
		fmt.Println("Error in ContactsApi->CreateContact", err.Error())
		return err
	}
	fmt.Println("CreateContact Object:", obj, " CreateContact Response: ", resp)
	return nil
}

func (sib *SendInBlue) DeleteContact(ctx context.Context, email string) error {
	resp, err := sib.ContactsApi.DeleteContact(ctx, email)
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

func (sib *SendInBlue) WebhookUnsubscribed(c *gin.Context) (email string, err error) {
	var body *webhookUnsubscribeResponse
	if err = c.BindJSON(body); err != nil {
		return "", err
	}

	return body.Email, nil
}
