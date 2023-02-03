package models

import (
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
	"gopkg.in/guregu/null.v3/zero"
)

var validate = validator.New()

var ErrChainNotFound = errors.New("Chain not found")

type Chain struct {
	ID               uint
	UID              string      `gorm:"uniqueIndex"`
	FID              zero.String `gorm:"column:fid"`
	Name             string
	Description      string
	Address          string
	Latitude         float64
	Longitude        float64
	Radius           float32
	Published        bool
	OpenToNewMembers bool
	Sizes            []string `gorm:"serializer:json"`
	Genders          []string `gorm:"serializer:json"`
	UserChains       []UserChain
	Route 				   []string `gorm:"serializer:json; default:[]"`
	UpdatedAt        time.Time
	DeletedAt        zero.Time
}
