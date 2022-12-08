package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateGenderValid(t *testing.T) {
	sut := ValidateAllGenderEnum([]string{
		GenderEnumChildren,
		GenderEnumWomen,
		GenderEnumMen,
	})

	assert.True(t, sut)
}

func TestValidateGenderValidEmpty(t *testing.T) {
	sut := ValidateAllGenderEnum([]string{})

	assert.True(t, sut)
}

func TestValidateGenderInvalid(t *testing.T) {
	sut := ValidateAllGenderEnum([]string{
		"1incorrect",
		"2",
	})

	assert.False(t, sut)
}

func TestValidateGenderInvalidNotUnique(t *testing.T) {
	sut := ValidateAllGenderEnum([]string{
		GenderEnumChildren,
		GenderEnumChildren,
	})

	assert.False(t, sut)
}
