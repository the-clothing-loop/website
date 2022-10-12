package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

var ErrChainNotFound = errors.New("Chain not found")

type Chain struct {
	ID               uint
	UID              string         `gorm:"uniqueIndex"`
	FID              sql.NullString `gorm:"column:fid"`
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
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
