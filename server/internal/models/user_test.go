package models

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestHideUserInformation(t *testing.T) {
	u := User{}
	assert.Empty(t, u.Address)
	hideUserInformation(false, &u)
	assert.Equal(t, u.Address, "***")
	assert.Equal(t, lo.FromPtr(u.Email), "***")
	assert.Equal(t, u.PhoneNumber, "***")
}
