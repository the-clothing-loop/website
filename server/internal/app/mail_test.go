package app_test

import (
	"net/mail"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMailAddressToStingIllegalEmail(t *testing.T) {
	a := mail.Address{
		Name:    "John",
		Address: "",
	}
	ans := a.String()
	assert.Equal(t, `"John" <@>`, ans)
}
