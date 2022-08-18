package mocks

import (
	"fmt"
	"log"
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	Faker "github.com/jaswdr/faker"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

var faker = Faker.New()

// some options are negatives of the used value
// this is to keep the defaults to false when not specifically used
type MockChainAndUserOptions struct {
	IsEmailUnverified  bool
	IsTokenUnverified  bool
	IsRootAdmin        bool
	IsChainAdmin       bool
	IsDisabled         bool
	IsNotPublished     bool
	IsOpenToNewMembers bool
}

func MockUser(t *testing.T, db *gorm.DB, chainID uint, o MockChainAndUserOptions) (user *models.User, token string) {
	user = &models.User{
		UID:             uuid.NewV4().String(),
		Email:           fmt.Sprintf("%s@%s", faker.UUID().V4(), faker.Internet().FreeEmailDomain()),
		IsEmailVerified: !o.IsEmailUnverified,
		IsRootAdmin:     o.IsRootAdmin,
		Name:            "Test " + faker.Person().Name(),
		PhoneNumber:     faker.Person().Contact().Phone,
		Sizes:           []string{},
		Address:         faker.Address().Address(),
		Enabled:         !o.IsDisabled,
		UserToken: []models.UserToken{
			{
				Token:    uuid.NewV4().String(),
				Verified: !o.IsTokenUnverified,
			},
		},
		Chains: []models.UserChain{
			{
				ChainID:      chainID,
				IsChainAdmin: o.IsChainAdmin,
			},
		},
	}
	log.Printf("IsChainAdmin: %v", o.IsChainAdmin)
	if res := db.Create(user); res.Error != nil {
		log.Fatalf("Unable to create testUser: %v", res.Error)
	}

	t.Cleanup(func() {
		tx := db.Begin()
		tx.Exec(`DELETE FROM user_chains WHERE chain_id = ?`, chainID)
		tx.Exec(`DELETE FROM user_tokens WHERE user_id = ?`, user.ID)
		tx.Exec(`DELETE FROM users WHERE id = ?`, user.ID)
		tx.Commit()
	})

	return user, user.UserToken[0].Token
}
func MockChainAndUser(t *testing.T, db *gorm.DB, o MockChainAndUserOptions) (chain *models.Chain, user *models.User, token string) {
	chain = &models.Chain{
		UID:              uuid.NewV4().String(),
		Name:             "Test " + faker.Company().Name(),
		Description:      faker.Company().CatchPhrase(),
		Address:          faker.Address().Address(),
		Latitude:         faker.Address().Latitude(),
		Longitude:        faker.Address().Latitude(),
		Radius:           float32(Faker.Faker.RandomFloat(faker, 3, 2, 30)),
		Published:        !o.IsNotPublished,
		OpenToNewMembers: o.IsOpenToNewMembers,
		ChainSizes:       []models.ChainSize{},
		UserChains:       []models.UserChain{},
	}

	if res := db.Create(&chain); res.Error != nil {
		log.Fatalf("Unable to create testChain: %v", res.Error)
	}

	// Cleanup runs FiLo
	// So Cleanup must happen before MockUser
	t.Cleanup(func() {
		db.Exec(`DELETE FROM chains WHERE id = ?`, chain.ID)
	})

	user, token = MockUser(t, db, chain.ID, o)

	return chain, user, token
}
