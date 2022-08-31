package controllers

import (
	"encoding/json"
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
	stripe_customer "github.com/stripe/stripe-go/v73/customer"
	stripe_subscription "github.com/stripe/stripe-go/v73/subscription"
	stripe_webhook "github.com/stripe/stripe-go/v73/webhook"
	"gorm.io/gorm"
)

// Rewrite of https://github.com/CollActionteam/clothing-loop/blob/e5d09d38d72bb42f531d0dc0ec7a5b18459bcbcd/firebase/functions/src/payments.ts#L18
func PaymentsInitiate(c *gin.Context) {
	var body struct {
		PriceCents  int64  `json:"price_cents" binding:"omitempty"`
		Email       string `json:"email" binding:"omitempty,email"`
		IsRecurring bool   `json:"is_recurring"`
		PriceID     string `json:"price_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, "email required in json")
		return
	}

	db := getDB(c)

	checkoutSessionModePayment := string(stripe.CheckoutSessionModePayment)
	checkoutSessionModeSetup := string(stripe.CheckoutSessionModeSetup)
	currency := "eur"
	quantity := int64(1)
	name := "Donation"
	priceCents := body.PriceCents
	customerEmail := body.Email
	successURL := app.Config.SITE_BASE_URL_FE + "/donate/thankyou"
	cancelURL := app.Config.SITE_BASE_URL_FE + "/donate/cancel"

	checkout := new(stripe.CheckoutSessionParams)

	if body.IsRecurring {
		checkout.PaymentMethodTypes = stripe.StringSlice([]string{
			string(stripe.PaymentMethodTypeSEPADebit),
			string(stripe.PaymentMethodTypeCard),
		})
		checkout.Mode = &checkoutSessionModeSetup
	} else {
		checkout.PaymentMethodTypes = stripe.StringSlice([]string{
			string(stripe.PaymentMethodTypeIDEAL),
			string(stripe.PaymentMethodTypeCard),
		})
		checkout.Mode = &checkoutSessionModePayment
		checkout.LineItems = []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: &currency,
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: &name,
					},
					UnitAmount: &priceCents,
				},
				Quantity: &quantity,
			},
		}
	}

	checkout.SuccessURL = &successURL
	checkout.CancelURL = &cancelURL
	checkout.Metadata = map[string]string{"price_id": body.PriceID}

	if customerEmail != "" {
		checkout.CustomerEmail = &customerEmail
	}

	session, err := stripe_session.New(checkout)
	if err != nil {
		log.Print(err)
		boom.Illegal(c.Writer, "Something went wrong when processing your checkout request...")
		return
	}

	if err := db.Create(&models.Payment{
		Amount:          float32(session.AmountTotal) / 100,
		Email:           customerEmail,
		IsRecurring:     body.IsRecurring,
		SessionStripeID: session.ID,
		Status:          string(session.Status),
	}).Error; err != nil {
		log.Print(err)
		boom.Internal(c.Writer, "unable to add payment to database")
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
		c.AbortWithError(400, fmt.Errorf("body does not exist"))
		return
	}
	event, err := stripe_webhook.ConstructEvent(body, signature, app.Config.STRIPE_WEBHOOK)
	if err != nil {
		c.AbortWithError(400, fmt.Errorf("webhook Error: %s", err))
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
		log.Print(err)
		boom.Internal(c.Writer)
		return
	}

	switch session.Mode {
	case stripe.CheckoutSessionModeSetup:
		paymentsWebhookCheckoutSessionCompletedModeSetup(c, db, session)
	case stripe.CheckoutSessionModePayment:
		paymentsWebhookCheckoutSessionCompletedModePayment(c, db, session)
	default:
		c.JSON(200, gin.H{"received": true})
	}
}

func paymentsWebhookCheckoutSessionCompletedModeSetup(c *gin.Context, db *gorm.DB, session *stripe.CheckoutSession) {
	priceID := session.Metadata["price_id"]
	intent := session.SetupIntent
	billingDetails := session.PaymentIntent.PaymentMethod.BillingDetails
	paymentMethodType := (*string)(&intent.PaymentMethod.Type)

	customer, err := stripe_customer.New(&stripe.CustomerParams{
		Email: &billingDetails.Email,
		Name:  &billingDetails.Name,
		Address: &stripe.AddressParams{
			City:       &billingDetails.Address.City,
			Country:    &billingDetails.Address.Country,
			Line1:      &billingDetails.Address.Line1,
			Line2:      &billingDetails.Address.Line2,
			PostalCode: &billingDetails.Address.PostalCode,
			State:      &billingDetails.Address.State,
		},
		PaymentMethod: paymentMethodType,
		InvoiceSettings: &stripe.CustomerInvoiceSettingsParams{
			DefaultPaymentMethod: paymentMethodType,
		},
	})
	if err != nil {
		log.Print(err)
		boom.Internal(c.Writer, "Unable to create customer")
		return
	}

	_, err = stripe_subscription.New(&stripe.SubscriptionParams{
		Customer: &customer.ID,
		Items: []*stripe.SubscriptionItemsParams{
			{Price: &priceID},
		},
	})
	if err != nil {
		log.Print(err)
		boom.Internal(c.Writer, "Unable to create subscription")
		return
	}

	err = db.Model(&models.Payment{}).Where("session_stripe_id = ?", session.ID).Updates(&models.Payment{
		Status:                string(session.Status),
		CustomerStripeID:      customer.ID,
		PaymentIntentStripeID: session.PaymentIntent.ID,
	}).Error
	if err != nil {
		log.Print(err)
		boom.Internal(c.Writer, "Unable to update payment in database")
		return
	}

	c.JSON(200, gin.H{"received": true})
}

func paymentsWebhookCheckoutSessionCompletedModePayment(c *gin.Context, db *gorm.DB, session *stripe.CheckoutSession) {
	// ! Warning session.Customer is nil here
	err := db.Model(&models.Payment{}).Where("session_stripe_id = ?", session.ID).UpdateColumns(&models.Payment{
		Status:                string(session.Status),
		CustomerStripeID:      "",
		PaymentIntentStripeID: session.PaymentIntent.ID,
		Email:                 session.CustomerEmail,
	}).Error
	if err != nil {
		log.Print(err)
		boom.Internal(c.Writer, "Unable to update payment in database")
		return
	}

	c.JSON(200, gin.H{"received": true})
}
