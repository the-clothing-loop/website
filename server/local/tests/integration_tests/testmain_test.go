package integration_tests

import (
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"gorm.io/gorm"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../../..")
}
