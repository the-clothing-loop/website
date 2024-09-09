//go:build !ci

package services_test

import (
	"context"
	"testing"

	"github.com/ascii8/nakama-go"
	"github.com/jaswdr/faker"
	"github.com/stretchr/testify/assert"
)

var Faker = faker.New()

func TestNakama(t *testing.T) {
	l1 := NewLifeTime()
	l2 := NewLifeTime()

	name := Faker.Person().Name()
	pass := Faker.RandomStringWithLength(30)

	err := l1.CreateNewUser(name, pass)
	assert.Empty(t, err)
	a1, err := l1.Client.Account(l2.ctx)
	assert.Empty(t, err)

	err = l2.CreateNewUser(name, pass)
	assert.Empty(t, err)
	a2, err := l2.Client.Account(l2.ctx)
	assert.Empty(t, err)

	assert.Equal(t, a1.User.Id, a2.User.Id)
}

type LifeTime struct {
	Client *nakama.Client
	ctx    context.Context
}

func NewLifeTime() *LifeTime {
	cl := nakama.New(nakama.WithServerKey("defaultkey"), nakama.WithURL("http://localhost:7350"))
	return &LifeTime{
		Client: cl,
		ctx:    context.Background(),
	}
}

func (l *LifeTime) CreateNewUser(name, password string) error {
	return l.Client.AuthenticateCustom(l.ctx, password, true, name)
}
