package tests

import (
	"log"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	Faker "github.com/jaswdr/faker"
	uuid "github.com/satori/go.uuid"
)

var faker = Faker.New()

type testIDs struct {
	ChainIDs []uint
	UserIDs  []uint
}

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

func (d *testIDs) MockUser(chainID uint, o MockChainAndUserOptions) (user *models.User, token string) {
	user = &models.User{
		UID:             uuid.NewV4().String(),
		Email:           faker.Person().Contact().Email,
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
	d.UserIDs = append(d.UserIDs, user.ID)

	return user, user.UserToken[0].Token
}
func (d *testIDs) MockChainAndUser(o MockChainAndUserOptions) (chain *models.Chain, user *models.User, token string) {
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
		Sizes:            []models.ChainSize{},
		Users:            []models.UserChain{},
	}

	if res := db.Create(&chain); res.Error != nil {
		log.Fatalf("Unable to create testChain: %v", res.Error)
	}
	d.ChainIDs = append(d.ChainIDs, chain.ID)

	user, token = d.MockUser(chain.ID, o)

	return chain, user, token
}

func (d *testIDs) Purge() {
	tx := db.Begin()
	tx.Exec(`DELETE FROM user_chains WHERE chain_id IN ?`, d.ChainIDs)
	tx.Exec(`DELETE FROM user_tokens WHERE user_id IN ?`, d.UserIDs)
	tx.Exec(`DELETE FROM users WHERE id IN ?`, d.UserIDs)
	tx.Exec(`DELETE FROM chains WHERE id IN ?`, d.ChainIDs)
	tx.Commit()
}
