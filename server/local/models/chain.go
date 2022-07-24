package models

import (
	"strings"

	"gorm.io/gorm"
)

type Chain struct {
	gorm.Model
	UID              string `gorm:"uniqueIndex"`
	Name             string
	Description      string
	Address          string
	Latitude         float32
	Longitude        float32
	Radius           float32
	Published        bool
	OpenToNewMembers bool
	Categories       []CategoriesLL
	Sizes            []ChainSize
	Users            []UserChainLL
}

const (
	CategoryEnumChildren = "1"
	CategoryEnumWomen    = "2"
	CategoryEnumMen      = "3"
)

func ValidateCategoryEnum(s string) bool {
	if index := strings.Index("123", s); index == -1 {
		return false
	}

	return true
}
func ValidateAllCategoryEnum(arr []string) bool {
	for _, s := range arr {
		if ok := ValidateCategoryEnum(s); !ok {
			return false
		}
	}
	return true
}

type CategoriesLL struct {
	ID           uint
	ChainID      uint
	CategoryEnum string
}

const (
	SizeEnumBaby          = "1"
	SizeEnum1_4YearsOld   = "2"
	SizeEnum5_12YearsOld  = "3"
	SizeEnumWomenSmall    = "4"
	SizeEnumWomenMedium   = "5"
	SizeEnumWomenLarge    = "6"
	SizeEnumWomenPlusSize = "7"
	SizeEnumMenSmall      = "8"
	SizeEnumMenMedium     = "9"
	SizeEnumMenLarge      = "A"
	SizeEnumMenPlusSize   = "B"
)

func ValidateSizeEnum(s string) bool {
	if index := strings.Index("123456789AB", s); index == -1 {
		return false
	}

	return true
}
func ValidateAllSizeEnum(arr []string) bool {
	for _, s := range arr {
		if ok := ValidateSizeEnum(s); !ok {
			return false
		}
	}
	return true
}

type ChainSize struct {
	ID       uint
	ChainID  uint
	SizeEnum string
}
