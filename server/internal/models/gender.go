package models

import "errors"

const (
	GenderEnumChildren = "1"
	GenderEnumWomen    = "2"
	GenderEnumMen      = "3"
	GenderEnumToys     = "4"
	GenderEnumBooks    = "5"
)

var ErrGenderInvalid = errors.New("Invalid gender enum")

func ValidateAllGenderEnum(arr []string) bool {
	if err := validate.Var(arr, "unique"); err != nil {
		return false
	}
	for _, s := range arr {
		if err := validate.Var(s, "oneof=1 2 3 4 5,required"); err != nil {
			return false
		}
	}
	return true
}
