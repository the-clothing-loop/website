package sharedtypes

type PaymentsInitiateRequest struct {
	PriceCents  int64  `json:"price_cents" binding:"omitempty"`
	Email       string `json:"email" binding:"required,email"`
	IsRecurring bool   `json:"is_recurring"`
	PriceID     string `json:"price_id"`
}

type PaymentsInitiateResponse struct {
	SessionID string `json:"session_id"`
}
