package models

import (
	"database/sql"
	"time"

	"github.com/stripe/stripe-go/v73"
	"gopkg.in/guregu/null.v3/zero"
)

const (
	PaymentStatusEnumComplete = stripe.CheckoutSessionStatusComplete
	PaymentStatusEnumOpen     = stripe.CheckoutSessionStatusOpen
	PaymentStatusEnumExpired  = stripe.CheckoutSessionStatusExpired
)

type Payment struct {
	ID  uint
	FID sql.NullString `gorm:"column:fid"`
	// Euro cents
	Amount                float32
	Email                 string
	IsRecurring           bool
	SessionStripeID       zero.String `gorm:"uniqueIndex"`
	CustomerStripeID      string
	PaymentIntentStripeID string
	Status                string
	CreatedAt             time.Time
	UpdatedAt             time.Time
}
