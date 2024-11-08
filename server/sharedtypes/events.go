package sharedtypes

import (
	"time"
)

// ENUM(free, entrance, donation, perswap)
type EventPriceType string

type Event struct {
	ID             uint            `json:"-"`
	UID            string          `gorm:"uniqueIndex" json:"uid"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	Latitude       float64         `json:"latitude"`
	Longitude      float64         `json:"longitude"`
	Address        string          `json:"address"`
	PriceValue     float64         `json:"price_value"`
	PriceCurrency  *string         `json:"price_currency"`
	PriceType      *EventPriceType `json:"price_type"`
	Link           string          `json:"link"`
	Date           time.Time       `json:"date"`
	DateEnd        *time.Time      `json:"date_end"`
	Genders        []string        `gorm:"serializer:json" json:"genders"`
	ChainID        *uint           `json:"-"`
	ChainUID       *string         `json:"chain_uid" gorm:"-:migration;<-:false"`
	UserID         uint            `json:"-"`
	CreatedAt      time.Time       `json:"-"`
	UpdatedAt      time.Time       `json:"-"`
	UserUID        *string         `json:"user_uid" gorm:"-:migration;<-:false"`
	UserName       *string         `json:"user_name" gorm:"-:migration;<-:false"`
	UserEmail      *string         `json:"user_email" gorm:"-:migration;<-:false"`
	ImageUrl       string          `json:"image_url"`
	ImageDeleteUrl string          `json:"-"`
	ChainName      *string         `json:"chain_name" gorm:"-:migration;<-:false"`
}

type EventCreateRequest struct {
	Name           string         `json:"name" binding:"required"`
	Description    string         `json:"description"`
	Latitude       float64        `json:"latitude" binding:"required,latitude"`
	Longitude      float64        `json:"longitude" binding:"required,longitude"`
	Address        string         `json:"address" binding:"required"`
	PriceValue     float64        `json:"price_value"`
	PriceCurrency  string         `json:"price_currency"`
	PriceType      EventPriceType `json:"price_type" binding:"required"`
	Link           string         `json:"link"`
	Date           time.Time      `json:"date" binding:"required"`
	DateEnd        *time.Time     `json:"date_end" binding:"omitempty"`
	Genders        []string       `json:"genders" binding:"required"`
	ChainUID       string         `json:"chain_uid,omitempty" binding:"omitempty"`
	ImageUrl       string         `json:"image_url" binding:"required,url"`
	ImageDeleteUrl string         `json:"image_delete_url" binding:"omitempty,url"`
}

type EventUpdateRequest struct {
	UID            string          `json:"uid" binding:"required,uuid"`
	Name           *string         `json:"name,omitempty"`
	Description    *string         `json:"description,omitempty"`
	Address        *string         `json:"address,omitempty"`
	Link           *string         `json:"link,omitempty"`
	PriceValue     *float64        `json:"price_value,omitempty"`
	PriceCurrency  *string         `json:"price_currency,omitempty"`
	PriceType      *EventPriceType `json:"price_type,omitempty"`
	Latitude       *float64        `json:"latitude,omitempty" binding:"omitempty,latitude"`
	Longitude      *float64        `json:"longitude,omitempty" binding:"omitempty,longitude"`
	Date           *time.Time      `json:"date,omitempty"`
	DateEnd        *time.Time      `json:"date_end,omitempty"`
	Genders        *[]string       `json:"genders,omitempty"`
	ImageUrl       *string         `json:"image_url,omitempty"`
	ImageDeleteUrl *string         `json:"image_delete_url,omitempty"`
	ChainUID       *string         `json:"chain_uid,omitempty"`
}
