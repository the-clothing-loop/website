package controllers

import (
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v73"
	stripe_session "github.com/stripe/stripe-go/v73/checkout/session"
	stripe_webhook "github.com/stripe/stripe-go/v73/webhook"
)

// Rewrite of https://github.com/CollActionteam/clothing-loop/blob/e5d09d38d72bb42f531d0dc0ec7a5b18459bcbcd/firebase/functions/src/payments.ts#L18
func PaymentsInitiate(c *gin.Context) {
	var body struct {
		// Euro cents
		Amount      int64  `json:"amount" binding:"omitempty"`
		Email       string `json:"email" binding:"omitempty,email"`
		IsRecurring bool   `json:"is_recurring"`
		PriceId     string `json:"price_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, "email required in json")
		return
	}

	db := getDB(c)

	paymentMethodTypeIDEAL := "ideal"          // stripe.PaymentMethodTypeIDEAL
	paymentMethodTypeCard := "card"            // stripe.PaymentMethodTypeCard
	paymentMethodTypeSEPADebit := "sepa_debit" // stripe.PaymentMethodTypeSEPADebit
	checkoutSessionModePayment := "payment"    // stripe.CheckoutSessionModePayment
	checkoutSessionModeSetup := "setup"        // stripe.CheckoutSessionModeSetup
	currency := "eur"
	quantity := int64(1)
	name := "Donation"
	price := body.Amount
	customerEmail := body.Email
	successURL := app.Config.SITE_BASE_URL + "/donate/thankyou"
	cancelURL := app.Config.SITE_BASE_URL + "/donate/cancel"

	checkout := &stripe.CheckoutSessionParams{
		Currency:           &currency,
		PaymentMethodTypes: []*string{&paymentMethodTypeIDEAL, &paymentMethodTypeCard},
		Mode:               &checkoutSessionModePayment,
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Quantity: &quantity,
				Name:     &name,
				Amount:   &price,
			},
		},
		SuccessURL: &successURL,
		CancelURL:  &cancelURL,
	}

	if body.IsRecurring {
		checkout.PaymentMethodTypes = []*string{&paymentMethodTypeSEPADebit, &paymentMethodTypeCard}
		checkout.Mode = &checkoutSessionModeSetup
		checkout.Metadata = map[string]string{
			"price_id": body.PriceId,
		}
	}

	if customerEmail != "" {
		checkout.CustomerEmail = &customerEmail
	}

	session, err := stripe_session.New(checkout)
	if err != nil {
		log.Print(err)
		boom.Illegal(c.Writer, "Something went wrong when processing your checkout request...")
		return
	}

	db.Create(models.Payment{
		SessionID:   session.ID,
		Amount:      float32(session.AmountTotal) / 100,
		Email:       customerEmail,
		IsRecurring: body.IsRecurring,
	})

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
		c.AbortWithError(400, fmt.Errorf("body does not exist"))
		return
	}
	event, err := stripe_webhook.ConstructEvent(body, signature, app.Config.STRIPE_WEBHOOK)
	if err != nil {
		c.AbortWithError(400, fmt.Errorf("webhook Error: %s", err))
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		paymentsWebhookCheckoutSessionCompleted(c, event)
	default:
		c.JSON(200, gin.H{"received": true})
	}
}

func paymentsWebhookCheckoutSessionCompleted(c *gin.Context, event stripe.Event) {
	session := event.Data.Object

	log.Printf("paymentsWebhookCheckoutSessionCompleted: %+v", session)
}
