//go:build !ci

package integration_tests

import (
	"testing"

	Faker "github.com/jaswdr/faker"
	"github.com/the-clothing-loop/website/server/internal/app"
	"gorm.io/gorm"
)

var db *gorm.DB
var faker = Faker.New()

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../../..")
}
