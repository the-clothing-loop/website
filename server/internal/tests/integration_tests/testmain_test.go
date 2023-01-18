package integration_tests

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	Faker "github.com/jaswdr/faker"
	"gorm.io/gorm"
)

var db *gorm.DB
var faker = Faker.New()

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../../..")
}
