package mocks

import (
	"fmt"
	"html/template"
	"log/slog"
	"math/rand"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
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
	IsPausedLoopOnly   bool
	RoutePrivacy       *int
	RouteOrderIndex    int

	// for generating new members
	IsNotActive         bool
	OnlyEmailExampleCom bool
	OverrideLongitude   *float64
	OverrideLatitude    *float64
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
type MockBagOptions struct {
	BagNameOverride string
}

func MockUser(t *testing.T, db *gorm.DB, chainID uint, o MockChainAndUserOptions) (user *models.User, token string) {
	var latitude, longitude float64
	if faker.RandomNumber(5)+1 > 4 { // 4 / 6
		// use the netherlands
		coords := FakeDutchCoordinates()
		latitude = coords.Latitude
		longitude = coords.Longitude
	} else {
		latitude = faker.Address().Latitude()
		longitude = faker.Address().Longitude()
	}
	if o.OverrideLatitude != nil {
		latitude = *o.OverrideLatitude
	}
	if o.OverrideLongitude != nil {
		longitude = *o.OverrideLongitude
	}
	chains := []models.UserChain{}
	if chainID != 0 {
		chains = append(chains, models.UserChain{
			ChainID:      chainID,
			IsChainAdmin: o.IsChainAdmin,
			IsApproved:   !o.IsNotApproved,
			RouteOrder:   o.RouteOrderIndex,
			IsPaused:     o.IsPausedLoopOnly,
		})
	}

	userTokens := []models.UserToken{}
	token = uuid.NewV4().String()
	if o.IsNotTokenVerified {
		userTokens = append(userTokens, models.UserToken{
			Token:    token,
			Verified: !o.IsNotTokenVerified,
		})
	}

	user = &models.User{
		UID:             uuid.NewV4().String(),
		Email:           zero.StringFrom(fmt.Sprintf("%s@%s", faker.UUID().V4(), lo.Ternary(o.OnlyEmailExampleCom, "example.com", faker.Internet().FreeEmailDomain()))),
		IsEmailVerified: !o.IsNotEmailVerified,
		IsRootAdmin:     o.IsRootAdmin,
		Name:            "Fake " + faker.Person().Name(),
		PhoneNumber:     faker.Person().Contact().Phone,
		Sizes:           MockSizes(false),
		Address:         faker.Address().Address(),
		Latitude:        latitude,
		Longitude:       longitude,
		UserToken:       userTokens,
		Chains:          chains,
	}

	if o.IsNotActive {
		user.PausedUntil = null.NewTime(time.Now().Add(7*time.Hour), true)
	}

	if err := db.Create(user).Error; err != nil {
		slog.Error("Unable to create testUser", "err", err)
		os.Exit(1)
	}

	if !o.IsNotTokenVerified {
		var err error
		token, err = auth.JwtGenerate(user)
		if err != nil {
			slog.Error("Unable to generate token", "err", err)
			os.Exit(1)
		}
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

	return user, token
}

func MockChainAndUser(t *testing.T, db *gorm.DB, o MockChainAndUserOptions) (chain *models.Chain, user *models.User, token string) {
	var latitude, longitude float64
	if faker.RandomNumber(5)+1 > 4 { // 4 / 6
		// use the netherlands
		latitude = float64(faker.Int64Between(5169917, 5237403)) / 100000
		longitude = float64(faker.Int64Between(488969, 689583)) / 100000
	} else {
		latitude = faker.Address().Latitude()
		longitude = faker.Address().Longitude()
	}
	routePrivacy := 2
	if o.RoutePrivacy != nil {
		routePrivacy = *o.RoutePrivacy
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
		RoutePrivacy:     routePrivacy,
		Sizes:            MockSizes(true),
		Genders:          MockGenders(false),
		UserChains:       []models.UserChain{},
	}

	if err := db.Create(&chain).Error; err != nil {
		slog.Error("Unable to create testChain", "err", err)
		panic(err)
	}

	// Cleanup runs FiLo
	// So Cleanup must happen before MockUser
	t.Cleanup(func() {
		db.Exec(`DELETE FROM chains WHERE id = ?`, chain.ID)
	})

	user, token = MockUser(t, db, chain.ID, o)

	return chain, user, token
}

func MockAddUserToChain(t *testing.T, db *gorm.DB, chainID uint, user *models.User, o MockChainAndUserOptions) *models.UserChain {
	uc := &models.UserChain{
		UserID:       user.ID,
		ChainID:      chainID,
		IsChainAdmin: o.IsChainAdmin,
		IsApproved:   !o.IsNotApproved,
		RouteOrder:   o.RouteOrderIndex,
		IsPaused:     o.IsPausedLoopOnly,
	}
	err := db.Create(uc).Error
	if err != nil {
		slog.Error("Unable to create user chain")
		panic(err)
	}
	user.Chains = append(user.Chains, *uc)
	t.Cleanup(func() {
		db.Exec(`DELETE FROM user_chains WHERE chain_id = ? OR user_id = ?`, chainID, user.ID)
	})

	return uc
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
		models.SizeEnumTeenGirls,
		models.SizeEnumTeenBoys,
	}, zeroOrMore)
}
func MockGenders(zeroOrMore bool) (genders []string) {
	return randomEnums([]string{
		models.GenderEnumChildren,
		models.GenderEnumWomen,
		models.GenderEnumMen,
		models.GenderEnumToys,
		models.GenderEnumBooks,
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
		Longitude: faker.Address().Longitude(),
		Address:   faker.Address().Address(),
		Date:      time.Now().Add(time.Duration(faker.IntBetween(1, 20)) * time.Hour),
		Genders:   MockGenders(false),
		UserID:    userID,
		ChainID:   zero.IntFrom(int64(chainID)),
	}

	if err := db.Create(&event).Error; err != nil {
		slog.Error("Unable to create testEvent", "err", err)
		os.Exit(1)
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
		slog.Error("Unable to create testEvent", "err", err)
		os.Exit(1)
	}

	t.Cleanup(func() {
		db.Exec(`DELETE FROM mail_retries WHERE id = ?`, mail.ID)
	})

	return mail
}

func MockBag(t *testing.T, db *gorm.DB, chainID, userID uint, o MockBagOptions) *models.Bag {
	userChainID := uint(0)
	db.Raw("SELECT id FROM user_chains WHERE chain_id = ? AND user_id = ?", chainID, userID).Scan(&userChainID)
	if userChainID == 0 {
		return nil
	}

	name := o.BagNameOverride
	if name == "" {
		name = faker.Beer().Name()
	}

	colors := []string{
		"#C9843E",
		"#f4b63f",
		"#79A02D",
		"#66926e",
		"#199FBA",
		"#6494C2",
		"#1467b3",
		"#a899c2",
		"#513484",
		"#B37EAD",
		"#b76dac",
		"#F57BB0",
		"#A35C7B",
		"#E38C95",
		"#c73643",
		"#7D7D7D",
		"#3c3c3b",
	}

	bag := &models.Bag{
		Number:      name,
		Color:       faker.RandomStringElement(colors),
		UserChainID: userChainID,
	}
	if err := db.Create(bag).Error; err != nil {
		slog.Error("Unable to create testEvent", "err", err)
		os.Exit(1)
	}

	t.Cleanup(func() {
		db.Exec(`DELETE FROM bags WHERE id = ?`, bag.ID)
	})
	return bag
}

type Coordinates struct {
	Latitude  float64
	Longitude float64
}

func FakeDutchCoordinates() Coordinates {
	latitude := float64(faker.Int64Between(5219424, 5223461)) / 100000
	longitude := float64(faker.Int64Between(448153, 454333)) / 100000
	return Coordinates{
		Latitude:  latitude,
		Longitude: longitude,
	}
}
