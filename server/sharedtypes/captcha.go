package sharedtypes

type CaptchaRedeemRequest struct {
	Token string `json:"token" binding:"required"`
	// Array of [salt, target, solution] tuples
	Solutions [][]any `json:"solutions" binding:"required"`
}

type CaptchaRedeemResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token,omitempty"`
	Expires int64  `json:"expires,omitempty"`
}
