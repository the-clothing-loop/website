package sharedtypes

import "time"

type UserChain struct {
	ID                         uint        `json:"-"`
	UserID                     uint        `json:"-" gorm:"index"`
	UserUID                    string      `json:"user_uid" gorm:"-:migration;<-:false"`
	ChainID                    uint        `json:"-"`
	ChainUID                   string      `json:"chain_uid" gorm:"-:migration;<-:false"`
	IsChainAdmin               bool        `json:"is_chain_admin"`
	IsChainWarden              bool        `json:"is_chain_warden"`
	CreatedAt                  time.Time   `json:"created_at"`
	IsApproved                 bool        `json:"is_approved"`
	LastNotifiedIsUnapprovedAt *time.Time  `json:"-"`
	RouteOrder                 int         `json:"-"`
	IsPaused                   bool        `json:"is_paused"`
	Note                       *string     `json:"-" gorm:"->:false;<-:create"`
	Bags                       []Bag       `json:"-"`
	Bulky                      []BulkyItem `json:"-"`
}
