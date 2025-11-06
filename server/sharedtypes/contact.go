package sharedtypes

type ContactNewsletterRequest struct {
	Name      string `json:"name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Subscribe bool   `json:"subscribe"`
}

type ContactMailRequest struct {
	Token   string `json:"token" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Message string `json:"message" binding:"required"`
}
