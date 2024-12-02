package sharedtypes

type LoginEmailRequest struct {
	Email    string `binding:"required,email" json:"email"`
	IsApp    bool   `json:"app"`
	ChainUID string `json:"chain_uid" binding:"omitempty,uuid"`
}

type RegisterChainAdminRequest struct {
	Chain ChainCreateRequest `json:"chain" binding:"required"`
	User  UserCreateRequest  `json:"user" binding:"required"`
}

type RegisterBasicUserRequest struct {
	ChainUID string            `json:"chain_uid" binding:"omitempty,uuid"`
	User     UserCreateRequest `json:"user" binding:"required"`
}

type LoginSuperAsGenerateLinkRequest struct {
	UserUID string `json:"user_uid" binding:"required,uuid"`
	IsApp   bool   `json:"is_app"`
}
