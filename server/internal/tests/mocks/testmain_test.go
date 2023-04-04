package mocks_test

import (
	"flag"
	"testing"

	"github.com/golang/glog"
	"github.com/the-clothing-loop/website/server/internal/app"

	"gorm.io/gorm"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	app.RunTestMain(m, &db, "../../..")

	flag.Set("logtostderr", "true")
	flag.Parse()
	defer glog.Flush()
}
