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
	shutdown()
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
	// 	if res := db.Exec(`
	// DELETE FROM user_tokens
	// WHERE user_id = ?
	// `, 1); res.Error != nil {
	// 		log.Fatalf("Unable to shutdown: %v", res.Error)
	// 	}
}
