package main

import (
	"flag"
	"log"
	"strconv"
	"testing"

	Faker "github.com/jaswdr/faker"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

var faker = Faker.New()

// run the following to generate more
// `go run cmd/generate-fake-data/main.go 100`
func main() {
	repeat := 5
	flag.Parse()
	if a := flag.Arg(0); a != "" {
		n, _ := strconv.Atoi(a)
		if n > 1 {
			repeat = n
		}
	}
	app.ConfigInit(".")

	db := app.DatabaseInit()

	t := &testing.T{}

	chains := []*models.Chain{}
	userChainAdmins := []*models.User{}
	// userBasics := []*models.User{}

	for i := 0; i < repeat; i++ {
		chain, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
			IsChainAdmin: true,
		})

		chains = append(chains, chain)
		userChainAdmins = append(userChainAdmins, user)

		log.Printf("Generated -> Chain\t(ID: %d)", chain.ID)
		log.Printf("Generated -> User\t(ID: %d)", user.ID)
	}
	for i := 0; i < repeat; i++ {
		chainIndex := faker.IntBetween(0, len(chains)-1)
		chain := chains[chainIndex]

		user, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{})
		log.Printf("Generated -> User\t(ID: %d)", user.ID)
		// userBasics = append(userBasics, user)

		var eventChainID uint = 0
		if i > 3 {
			eventChainID = chain.ID
		}
		event := mocks.MockEvent(t, db, user.ID, eventChainID)
		log.Printf("Generated -> Event\t(ID: %d)", event.ID)
	}

	for _, user := range userChainAdmins {
		chainIndex := faker.IntBetween(0, len(chains)-1)
		chain := chains[chainIndex]

		var count int
		db.Raw(`SELECT COUNT(*) FROM user_chains WHERE user_id = ? AND chain_id = ?`, user.ID, chain.ID).Scan(&count)
		if count == 0 {
			db.Create(&models.UserChain{
				UserID:       user.ID,
				ChainID:      chain.ID,
				IsChainAdmin: false,
			})
		}
		log.Printf("Added     -> User\t(ID: %d)\tto Chain (ID: %d)", user.ID, chain.ID)

		bag := mocks.MockBag(t, db, chain.ID, user.ID, mocks.MockBagOptions{})
		log.Printf("Generated -> Bag\t(ID: %d)", bag.ID)
	}
}
