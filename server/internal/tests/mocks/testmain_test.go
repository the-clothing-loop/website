package mocks_test

import (
	"flag"
	"testing"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	glog "github.com/airbrake/glog/v4"
	"gorm.io/gorm"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../../..")

	flag.Set("logtostderr", "true")
	flag.Parse()
	defer glog.Flush()
}
