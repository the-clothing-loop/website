package models

import (
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

var validate = validator.New()

type Chain struct {
	gorm.Model
	UID              string `gorm:"uniqueIndex"`
	Name             string
	Description      string
	Address          string
	Latitude         float64
	Longitude        float64
	Radius           float32
	Published        bool
	OpenToNewMembers bool
	Sizes            []ChainSize
	Users            []UserChain
}

// requires Chain to contain Sizes
func (c *Chain) SizesToList() (sizesList []string) {
	for _, s := range c.Sizes {
		sizesList = append(sizesList, s.SizeEnum)
	}

	return sizesList
}

func SetSizesFromList(sizesList []string) (sizeTables []ChainSize) {
	for _, sizeEnum := range sizesList {
		sizeTables = append(sizeTables, ChainSize{SizeEnum: sizeEnum})
	}

	return sizeTables
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
	err := validate.Var(s, "oneof=1 2 3 4 5 6 7 8 9 A B,required")

	return err == nil
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
