package app

import (
	"encoding/base64"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfigBase64(t *testing.T) {
	// secret is "secret!@#$" which can not be sent by environment variable
	jwtSecret := "c2VjcmV0IUAjJA=="
	expectedSecret := "secret!@#$"

	b, err := base64.StdEncoding.DecodeString(jwtSecret)
	if err != nil {
		t.Error(err)
	}
	assert.Equal(t, expectedSecret, string(b))
}
