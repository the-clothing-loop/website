package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/pkg/ring_ext"
)

func TestFindCloseBy(t *testing.T) {
	r := ring_ext.NewWithValues([]uint{0, 1, 2, 3, 4, 5, 6, 7, 8, 9})

	tests := []struct {
		StartRing, FindRing uint
		ExpectedDistance    int
		Name                string
	}{
		{0, 2, 1, "Skip paused"},
		{4, 5, 1, "Normal"},
		{9, 0, 1, "Wrap"},
		{9, 6, 3, "Reverse normal"},
		{2, 0, 1, "Reverse skip paused"},
		{5, 8, 3, "Max distance"},
		{5, 9, -1, "Over max distance"},
	}

	for _, test := range tests {
		t.Run(test.Name, func(t *testing.T) {
			p := ring_ext.Find(r, test.StartRing)
			distance := findCloseBy(p, test.FindRing, []uint{1}, 3)
			assert.Equal(t, test.ExpectedDistance, distance)
		})
	}
}

func TestHideUserInformation(t *testing.T) {
	u := User{}
	assert.Empty(t, u.Address)
	hideUserInformation(false, &u)
	assert.Equal(t, u.Address, "***")
	assert.Equal(t, u.Email.String, "***")
	assert.Equal(t, u.PhoneNumber, "***")
}
