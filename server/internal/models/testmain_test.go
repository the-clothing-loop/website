package models_test

import (
	"testing"

	"github.com/the-clothing-loop/website/server/internal/app"
	"gorm.io/gorm"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../..")
}
