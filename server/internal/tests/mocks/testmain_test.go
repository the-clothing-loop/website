package mocks_test

import (
	"flag"
	"testing"

	"github.com/CollActionteam/clothing-loop/server/internal/app"
	"github.com/golang/glog"

	"gorm.io/gorm"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../../..")

	flag.Set("logtostderr", "true")
	flag.Parse()
	defer glog.Flush()
}
