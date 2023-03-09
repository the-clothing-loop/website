package mocks

import (
	"fmt"
	"math/rand"
	"testing"
	"time"

	"github.com/CollActionteam/clothing-loop/server/internal/models"
	glog "github.com/airbrake/glog/v4"
	Faker "github.com/jaswdr/faker"
	uuid "github.com/satori/go.uuid"
	"gopkg.in/guregu/null.v3/zero"
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
	IsNotPublished     bool
	IsOpenToNewMembers bool
	RouteOrderIndex    int
}

type MockEventOptions struct {
	IsNotPublished bool
}

func MockUser(t *testing.T, db *gorm.DB, chainID uint, o MockChainAndUserOptions) (user *models.User, token string) {
	user = &models.User{
		UID:             uuid.NewV4().String(),
		Email:           zero.StringFrom(fmt.Sprintf("%s@%s", faker.UUID().V4(), faker.Internet().FreeEmailDomain())),
		IsEmailVerified: !o.IsEmailUnverified,
		IsRootAdmin:     o.IsRootAdmin,
		Name:            "Fake " + faker.Person().Name(),
		PhoneNumber:     faker.Person().Contact().Phone,
		Sizes:           MockSizes(false),
		Address:         faker.Address().Address(),
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
				RouteOrder:   o.RouteOrderIndex,
			},
		},
	}
	if err := db.Create(user).Error; err != nil {
		glog.Fatalf("Unable to create testUser: %v", err)
	}

	t.Cleanup(func() {
		tx := db.Begin()
		tx.Exec(`DELETE FROM user_chains WHERE user_id = ? OR chain_id = ?`, user.ID, chainID)
		tx.Exec(`DELETE FROM user_tokens WHERE user_id = ?`, user.ID)
		tx.Exec(`DELETE FROM users WHERE id = ?`, user.ID)
		tx.Commit()
	})

	return user, user.UserToken[0].Token
}
func MockChainAndUser(t *testing.T, db *gorm.DB, o MockChainAndUserOptions) (chain *models.Chain, user *models.User, token string) {
	chain = &models.Chain{
		UID:              uuid.NewV4().String(),
		Name:             "Fake " + faker.Company().Name(),
		Description:      faker.Company().CatchPhrase(),
		Address:          faker.Address().Address(),
		Latitude:         faker.Address().Latitude(),
		Longitude:        faker.Address().Latitude(),
		Radius:           float32(faker.RandomFloat(3, 2, 30)),
		Published:        !o.IsNotPublished,
		OpenToNewMembers: o.IsOpenToNewMembers,
		Sizes:            MockSizes(true),
		Genders:          MockGenders(false),
		UserChains:       []models.UserChain{},
	}

	if err := db.Create(&chain).Error; err != nil {
		glog.Fatalf("Unable to create testChain: %v", err)
	}

	// Cleanup runs FiLo
	// So Cleanup must happen before MockUser
	t.Cleanup(func() {
		db.Exec(`DELETE FROM chains WHERE id = ?`, chain.ID)
	})

	user, token = MockUser(t, db, chain.ID, o)

	return chain, user, token
}

func MockSizes(zeroOrMore bool) []string {
	return randomEnums([]string{
		models.SizeEnumBaby,
		models.SizeEnum1_4YearsOld,
		models.SizeEnum5_12YearsOld,
		models.SizeEnumWomenSmall,
		models.SizeEnumWomenMedium,
		models.SizeEnumWomenLarge,
		models.SizeEnumWomenPlusSize,
		models.SizeEnumMenSmall,
		models.SizeEnumMenMedium,
		models.SizeEnumMenLarge,
		models.SizeEnumMenPlusSize,
	}, zeroOrMore)
}
func MockGenders(zeroOrMore bool) (genders []string) {
	return randomEnums([]string{
		models.GenderEnumChildren,
		models.GenderEnumWomen,
		models.GenderEnumMen,
	}, zeroOrMore)
}

func shuffleSlice[T any](arr []T) []T {
	rand.Shuffle(len(arr), func(i, j int) {
		arr[i], arr[j] = arr[j], arr[i]
	})

	return arr
}

func MockEvent(t *testing.T, db *gorm.DB, userID uint, o MockEventOptions) (event *models.Event) {
	event = &models.Event{
		UID:         uuid.NewV4().String(),
		Name:        "Fake " + faker.Company().Name(),
		Description: faker.Company().CatchPhrase(),
		Latitude:    faker.Address().Latitude(),
		Longitude:   faker.Address().Latitude(),
		Date:        time.Now().Add(time.Duration(faker.IntBetween(-20, 20)) * time.Hour),
		Genders:     MockGenders(false),
		UserEvents:  []models.UserEvent{{UserID: userID}},
	}

	if err := db.Create(&event).Error; err != nil {
		glog.Fatalf("Unable to create testEvent: %v", err)
	}

	// Cleanup runs FiLo
	// So Cleanup must happen before MockUser
	t.Cleanup(func() {
		db.Exec(`DELETE FROM user_events WHERE event_id = ? AND user_id = ?`, event.ID, userID)
		db.Exec(`DELETE FROM events WHERE id = ?`, event.ID)
	})

	return event
}

func randomEnums(enums []string, zeroOrMore bool) (result []string) {
	min := 0
	if zeroOrMore {
		min = -1
	}

	enums = shuffleSlice(enums)
	for i := 0; i <= faker.IntBetween(min, len(enums)-1); i++ {
		result = append(result, enums[i])
	}

	return result
}
