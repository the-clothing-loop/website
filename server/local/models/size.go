package models

import "errors"

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

var ErrSizeInvalid = errors.New("invalid size enum")

func ValidateAllSizeEnum(arr []string) bool {
	if err := validate.Var(arr, "unique"); err != nil {
		return false
	}
	for _, s := range arr {
		if err := validate.Var(s, "oneof=1 2 3 4 5 6 7 8 9 A B,required"); err != nil {
			return false
		}
	}
	return true
}
