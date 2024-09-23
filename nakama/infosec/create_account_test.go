package infosec

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateDoubleUser(t *testing.T) {
	email := Faker.Internet().Email()
	username := Faker.Internet().User()

	f := func() error {
		t.Helper()
		c := CreateClient()
		ctx := context.Background()
		pass := Faker.Internet().Password()

		err := c.AuthenticateEmail(ctx, email, pass, true, username)
		return err
	}
	err1 := f()
	assert.Nil(t, err1)

	// now run again from a different client and fail
	err2 := f()
	assert.Error(t, err2)
}
