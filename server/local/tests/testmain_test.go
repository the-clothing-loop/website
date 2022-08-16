package tests

import (
	"os"
	"testing"

	"github.com/CollActionteam/clothing-loop/server/local/app"
)

var mockTables *testIDs

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	if code == 0 {
		shutdown()
	}
	os.Exit(code)
}

func setup() {
	app.ConfigTestInit("../..")
	db = app.DatabaseInit()
	app.MailInit()

	mockTables = &testIDs{
		UserIDs:  []uint{},
		ChainIDs: []uint{},
	}
}

func shutdown() {
	mockTables.Purge()
}
