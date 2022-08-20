package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateSizeValid(t *testing.T) {
	sut := ValidateAllSizeEnum([]string{
		SizeEnumBaby,
		SizeEnum1_4YearsOld,
		SizeEnum5_12YearsOld,
		SizeEnumWomenSmall,
		SizeEnumWomenMedium,
		SizeEnumWomenLarge,
		SizeEnumWomenPlusSize,
		SizeEnumMenSmall,
		SizeEnumMenMedium,
		SizeEnumMenLarge,
		SizeEnumMenPlusSize,
	})

	assert.True(t, sut)
}
func TestValidateSizeValidEmpty(t *testing.T) {
	sut := ValidateAllSizeEnum([]string{})

	assert.True(t, sut)
}

func TestValidateSizeInvalid(t *testing.T) {
	sut := ValidateAllSizeEnum([]string{
		"1incorrect",
		"2",
	})

	assert.False(t, sut)
}
func TestValidateSizeInvalidNotUnique(t *testing.T) {
	sut := ValidateAllSizeEnum([]string{
		SizeEnum1_4YearsOld,
		SizeEnum1_4YearsOld,
	})

	assert.False(t, sut)
}
