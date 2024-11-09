package sharedtypes

import (
	"time"
)

type User struct {
	ID                    uint            `json:"-"`
	UID                   string          `json:"uid" gorm:"uniqueIndex"`
	FID                   *string         `json:"-" gorm:"column:fid"`
	Email                 *string         `json:"email" gorm:"unique"`
	IsEmailVerified       bool            `json:"is_email_verified"`
	IsRootAdmin           bool            `json:"is_root_admin"`
	PausedUntil           *time.Time      `json:"paused_until"`
	Name                  string          `json:"name"`
	PhoneNumber           string          `json:"phone_number"`
	Address               string          `json:"address"`
	Sizes                 []string        `json:"sizes" gorm:"serializer:json"`
	LastSignedInAt        *time.Time      `json:"-"`
	LastPokeAt            *time.Time      `json:"-"`
	UserToken             []UserToken     `json:"-"`
	Event                 []Event         `json:"-"`
	Chains                []UserChain     `json:"chains"`
	UserOnesignal         []UserOnesignal `json:"-"`
	CreatedAt             time.Time       `json:"-"`
	UpdatedAt             time.Time       `json:"-"`
	I18n                  string          `json:"i18n"`
	JwtTokenPepper        int             `json:"-" `
	Latitude              float64         `json:"-"`
	Longitude             float64         `json:"-"`
	AcceptedTOH           bool            `json:"-"`
	AcceptedDPA           bool            `json:"-"`
	AcceptedTOHJSON       *bool           `json:"accepted_toh,omitempty" gorm:"-:migration;<-:false"`
	AcceptedDPAJSON       *bool           `json:"accepted_dpa,omitempty" gorm:"-:migration;<-:false"`
	NotificationChainUIDs []string        `json:"notification_chain_uids,omitempty" gorm:"-"`
}

type UserCreateRequest struct {
	Email       string   `json:"email" binding:"required,email"`
	Name        string   `json:"name" binding:"required,min=3"`
	Address     string   `json:"address" binding:"required,min=3"`
	PhoneNumber string   `json:"phone_number" binding:"required,min=3"`
	Newsletter  bool     `json:"newsletter"`
	Sizes       []string `json:"sizes"`
	Latitude    float64  `json:"latitude"`
	Longitude   float64  `json:"longitude"`
}

type UserUpdateRequest struct {
	ChainUID      string     `json:"chain_uid,omitempty" binding:"omitempty,uuid"`
	UserUID       string     `json:"user_uid,omitempty" binding:"uuid"`
	Name          *string    `json:"name,omitempty"`
	PhoneNumber   *string    `json:"phone_number,omitempty"`
	Newsletter    *bool      `json:"newsletter,omitempty"`
	PausedUntil   *time.Time `json:"paused_until,omitempty"`
	ChainPaused   *bool      `json:"chain_paused,omitempty"`
	Sizes         *[]string  `json:"sizes,omitempty"`
	Address       *string    `json:"address,omitempty"`
	I18n          *string    `json:"i18n,omitempty"`
	Latitude      *float64   `json:"latitude,omitempty"`
	Longitude     *float64   `json:"longitude,omitempty"`
	AcceptedLegal *bool      `json:"accepted_legal,omitempty"`
}

type UserTransferChainRequest struct {
	TransferUserUID string `json:"transfer_user_uid" binding:"required,uuid"`
	FromChainUID    string `json:"from_chain_uid" binding:"required,uuid"`
	ToChainUID      string `json:"to_chain_uid" binding:"required,uuid"`
	IsCopy          bool   `json:"is_copy"`
}
