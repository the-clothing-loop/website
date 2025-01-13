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

func TestChatEmailToChatUserName(t *testing.T) {
	f := func(chatEmail, chatUserName string, expectErr bool) {
		t.Helper()

		s, err := UserChatEmailToChatUserName(chatEmail)
		if expectErr {
			assert.NotNil(t, err)
			assert.Nil(t, s)
		} else {
			assert.NoError(t, err)
			assert.Equal(t, chatUserName, *s)
		}
	}

	f("ayfpdh@example.com", "ayfpdh", false)
	f("ayfpdh@hotmail.com", "ayfpdh", true)
}
