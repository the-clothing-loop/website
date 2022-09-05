package models

import (
	"time"

	"github.com/stripe/stripe-go/v73"
)

const (
	PaymentStatusEnumComplete = stripe.CheckoutSessionStatusComplete
	PaymentStatusEnumOpen     = stripe.CheckoutSessionStatusOpen
	PaymentStatusEnumExpired  = stripe.CheckoutSessionStatusExpired
)

type Payment struct {
	ID uint
	// Euro cents
	Amount                float32
	Email                 string
	IsRecurring           bool
	SessionStripeID       string `gorm:"uniqueIndex"`
	CustomerStripeID      string
	PaymentIntentStripeID string
	Status                string
	CreatedAt             time.Time
	UpdatedAt             time.Time
}
