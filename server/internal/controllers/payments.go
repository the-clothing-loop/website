package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	"github.com/CollActionteam/clothing-loop/server/internal/app/gin_utils"
	"github.com/CollActionteam/clothing-loop/server/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v73"
	stripe_session "github.com/stripe/stripe-go/v73/checkout/session"
	stripe_webhook "github.com/stripe/stripe-go/v73/webhook"
	"gopkg.in/guregu/null.v3/zero"
)

// Rewrite of https://github.com/CollActionteam/clothing-loop/blob/e5d09d38d72bb42f531d0dc0ec7a5b18459bcbcd/firebase/functions/src/payments.ts#L18
func PaymentsInitiate(c *gin.Context) {
	var body struct {
		PriceCents  int64  `json:"price_cents" binding:"omitempty"`
		Email       string `json:"email" binding:"required,email"`
		IsRecurring bool   `json:"is_recurring"`
		PriceID     string `json:"price_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		gin_utils.GinAbortWithErrorBody(c, http.StatusBadRequest, errors.New("Email required"))
		return
	}

	db := getDB(c)

	name := "Donation"
	successURL := app.Config.SITE_BASE_URL_FE + "/donate/thankyou"
	cancelURL := app.Config.SITE_BASE_URL_FE + "/donate/cancel"

	checkout := new(stripe.CheckoutSessionParams)

	if body.IsRecurring {
		checkout.PaymentMethodTypes = stripe.StringSlice([]string{
			string(stripe.PaymentMethodTypeSEPADebit),
			string(stripe.PaymentMethodTypeCard),
		})
		checkout.Mode = stripe.String(string(stripe.CheckoutSessionModeSubscription))
		checkout.LineItems = []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    &body.PriceID,
				Quantity: stripe.Int64(1),
			},
		}
	} else {
		checkout.PaymentMethodTypes = stripe.StringSlice([]string{
			string(stripe.PaymentMethodTypeIDEAL),
			string(stripe.PaymentMethodTypeCard),
		})
		checkout.Mode = stripe.String(string(stripe.CheckoutSessionModePayment))
		checkout.LineItems = []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String(string(stripe.CurrencyEUR)),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: &name,
					},
					UnitAmount: stripe.Int64(body.PriceCents),
				},
				Quantity: stripe.Int64(1),
			},
		}
	}

	checkout.SuccessURL = &successURL
	checkout.CancelURL = &cancelURL

	if body.Email != "" {
		checkout.CustomerEmail = stripe.String(body.Email)
	}

	session, err := stripe_session.New(checkout)
	if err != nil {
		log.Print(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusUnavailableForLegalReasons, errors.New("Something went wrong when processing your checkout request..."))
		return
	}

	if err := db.Create(&models.Payment{
		Amount:          float32(session.AmountTotal) / 100,
		Email:           body.Email,
		IsRecurring:     body.IsRecurring,
		SessionStripeID: zero.StringFrom(session.ID),
		Status:          string(session.Status),
	}).Error; err != nil {
		log.Print(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to add payment to database"))
		return
	}

	c.JSON(200, gin.H{
		"session_id": session.ID,
	})
}

// Rewrite of https://github.com/CollActionteam/clothing-loop/blob/e5d09d38d72bb42f531d0dc0ec7a5b18459bcbcd/firebase/functions/src/payments.ts#L99
func PaymentsWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)

	signature := c.Request.Header.Get("stripe-signature")
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, 400, fmt.Errorf("Body does not exist"))
		return
	}
	event, err := stripe_webhook.ConstructEvent(body, signature, app.Config.STRIPE_WEBHOOK)
	if err != nil {
		gin_utils.GinAbortWithErrorBody(c, 400, fmt.Errorf("Webhook Error: %s", err))
		return
	}

	log.Printf("event.Type: %+v", event.Type)

	switch event.Type {
	case "checkout.session.completed":
		paymentsWebhookCheckoutSessionCompleted(c, event)
	default:
		c.JSON(200, gin.H{"received": true})
	}
}

func paymentsWebhookCheckoutSessionCompleted(c *gin.Context, event stripe.Event) {
	db := getDB(c)

	session := new(stripe.CheckoutSession)
	err := json.Unmarshal(event.Data.Raw, session)
	if err != nil {
		c.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Incorrect response from stripe"))
		return
	}

	err = db.Model(&models.Payment{}).Where("session_stripe_id = ?", session.ID).UpdateColumns(&models.Payment{
		Status: string(session.Status),
		Email:  session.CustomerEmail,
	}).Error
	if err != nil {
		c.Error(err)
		gin_utils.GinAbortWithErrorBody(c, http.StatusInternalServerError, errors.New("Unable to update payment in database"))
		return
	}

	c.JSON(200, gin.H{"received": true})
}
