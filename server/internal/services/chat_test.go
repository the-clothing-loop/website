package services_test

import (
	"testing"

	"github.com/GGP1/atoll"
	"github.com/stretchr/testify/assert"
)

func TestPasswordGen(t *testing.T) {
	p, _ := atoll.NewPassword(16, []atoll.Level{atoll.Digit, atoll.Lower, atoll.Upper})
	password := string(p)

	assert.NotEmpty(t, password)
}
