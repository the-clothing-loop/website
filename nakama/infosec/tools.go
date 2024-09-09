package infosec

import (
	"github.com/ascii8/nakama-go"
	"github.com/jaswdr/faker"
)

var Faker = faker.New()

func CreateClient() *nakama.Client {
	return nakama.New(nakama.WithURL("http://localhost:7350"), nakama.WithServerKey("defaultkey"))
}
