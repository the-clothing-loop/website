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

func TestValidateGenderInvalid(t *testing.T) {
	sut := ValidateAllGenderEnum([]string{
		"1incorrect",
		"2",
	})

	assert.False(t, sut)
}
