package mocks

import (
	"fmt"
	"html/template"
	"math/rand"
	"strings"
	"testing"
	"time"

	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/internal/models"

	Faker "github.com/jaswdr/faker"
	uuid "github.com/satori/go.uuid"
	"gopkg.in/guregu/null.v3"
	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

var faker = Faker.New()

// some options are negatives of the used value
// this is to keep the defaults to false when not specifically used
type MockChainAndUserOptions struct {
	IsNotEmailVerified bool
	IsNotTokenVerified bool
	IsNotApproved      bool
	IsRootAdmin        bool
	IsChainAdmin       bool
	IsNotPublished     bool
	IsOpenToNewMembers bool
	RouteOrderIndex    int
}

type MockEventOptions struct {
	IsNotPublished bool
}

type MockMailOptions struct {
	CreatedAt        time.Time
	IsErr            bool
	MaxRetryAttempts int
	NextRetryAttempt int
}

func MockUser(t *testing.T, db *gorm.DB, chainID uint, o MockChainAndUserOptions) (user *models.User, token string) {
	var latitude, longitude float64
	if faker.RandomNumber(5)+1 > 4 { // 4 / 6
		// use the netherlands
		latitude = float64(faker.Int64Between(5169917, 5237403)) / 100000
		longitude = float64(faker.Int64Between(488969, 689583)) / 100000
	} else {
		latitude = faker.Address().Latitude()
		longitude = faker.Address().Latitude()
	}
	chains := []models.UserChain{}
	if chainID != 0 {
		chains = append(chains, models.UserChain{
			ChainID:      chainID,
			IsChainAdmin: o.IsChainAdmin,
			IsApproved:   !o.IsNotApproved,
			RouteOrder:   o.RouteOrderIndex,
		})
	}
	user = &models.User{
		UID:             uuid.NewV4().String(),
		Email:           zero.StringFrom(fmt.Sprintf("%s@%s", faker.UUID().V4(), faker.Internet().FreeEmailDomain())),
		IsEmailVerified: !o.IsNotEmailVerified,
		IsRootAdmin:     o.IsRootAdmin,
		Name:            "Fake " + faker.Person().Name(),
		PhoneNumber:     faker.Person().Contact().Phone,
		Sizes:           MockSizes(false),
		Address:         faker.Address().Address(),
		Latitude:        latitude,
		Longitude:       longitude,
		UserToken: []models.UserToken{
			{
				Token:    uuid.NewV4().String(),
				Verified: !o.IsNotTokenVerified,
			},
		},
		Chains: chains,
	}
	if err := db.Create(user).Error; err != nil {
		glog.Fatalf("Unable to create testUser: %v", err)
	}

	t.Cleanup(func() {
		tx := db.Begin()
		tx.Exec(`DELETE FROM bags WHERE user_chain_id IN (
			SELECT id FROM user_chains WHERE chain_id = ? OR user_id = ?
		)`, chainID, user.ID)
		tx.Exec(`DELETE FROM user_chains WHERE user_id = ? OR chain_id = ?`, user.ID, chainID)
		tx.Exec(`DELETE FROM user_tokens WHERE user_id = ?`, user.ID)
		tx.Exec(`DELETE FROM users WHERE id = ?`, user.ID)
		tx.Commit()
	})

	return user, user.UserToken[0].Token
}

func MockChainAndUser(t *testing.T, db *gorm.DB, o MockChainAndUserOptions) (chain *models.Chain, user *models.User, token string) {
	var latitude, longitude float64
	if faker.RandomNumber(5)+1 > 4 { // 4 / 6
		// use the netherlands
		latitude = float64(faker.Int64Between(5169917, 5237403)) / 100000
		longitude = float64(faker.Int64Between(488969, 689583)) / 100000
	} else {
		latitude = faker.Address().Latitude()
		longitude = faker.Address().Latitude()
	}
	chain = &models.Chain{
		UID:              uuid.NewV4().String(),
		Name:             "Fake " + faker.Company().Name(),
		Description:      faker.Company().CatchPhrase(),
		Address:          faker.Address().Address(),
		CountryCode:      faker.Address().CountryCode(),
		Latitude:         latitude,
		Longitude:        longitude,
		Radius:           float32(Faker.Faker.RandomFloat(faker, 3, 2, 30)),
		Published:        !o.IsNotPublished,
		OpenToNewMembers: o.IsOpenToNewMembers,
		Sizes:            MockSizes(true),
		Genders:          MockGenders(false),
		UserChains:       []models.UserChain{},
	}

	if err := db.Create(&chain).Error; err != nil {
		goscope.Log.Fatalf("Unable to create testChain: %v", err)
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

func MockEvent(t *testing.T, db *gorm.DB, userID, chainID uint) (event *models.Event) {
	event = &models.Event{
		UID:  uuid.NewV4().String(),
		Name: "Fake " + faker.Company().Name(),
		Description: strings.Join([]string{
			faker.Lorem().Sentence(6),
			"",
			faker.Lorem().Sentence(12),
			faker.Lorem().Sentence(20),
			faker.Lorem().Sentence(2),
		}, "\n"),
		Latitude:  faker.Address().Latitude(),
		Longitude: faker.Address().Latitude(),
		Address:   faker.Address().Address(),
		Date:      time.Now().Add(time.Duration(faker.IntBetween(1, 20)) * time.Hour),
		Genders:   MockGenders(false),
		UserID:    userID,
		ChainID:   zero.IntFrom(int64(chainID)),
	}

	if err := db.Create(&event).Error; err != nil {
		glog.Fatalf("Unable to create testEvent: %v", err)
	}

	// Cleanup runs FiLo
	// So Cleanup must happen before MockUser
	t.Cleanup(func() {
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

func MockMail(t *testing.T, db *gorm.DB, o MockMailOptions) (mail *models.Mail) {
	mail = &models.Mail{
		SenderName:       faker.Person().Name(),
		SenderAddress:    faker.Person().Contact().Email,
		ToName:           faker.Person().Name(),
		ToAddress:        faker.Person().Contact().Email,
		Subject:          faker.Lorem().Sentence(5),
		Body:             template.HTMLEscapeString(faker.Lorem().Paragraph(3)),
		MaxRetryAttempts: o.MaxRetryAttempts,
		NextRetryAttempt: o.NextRetryAttempt,
	}
	if o.IsErr {
		mail.Err = null.NewString("FakeError: Invalid "+faker.Pet().Cat(), true)
	}
	if !o.CreatedAt.IsZero() {
		mail.CreatedAt = o.CreatedAt
	}

	if err := db.Create(mail).Error; err != nil {
		glog.Fatalf("Unable to create testEvent: %v", err)
	}

	t.Cleanup(func() {
		db.Exec(`DELETE FROM mail_retries WHERE id = ?`, mail.ID)
	})

	return mail
}
