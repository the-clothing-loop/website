package integration_tests

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	"gorm.io/gorm"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../../..")
}
