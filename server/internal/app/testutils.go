package app

import (
	"os"
	"testing"

	"gorm.io/gorm"
)

func RunTestMain(m *testing.M, dbP **gorm.DB, configPath string) {
	// setup
	ConfigTestInit(configPath)
	MailpitRemoveAllEmails()
	*dbP = DatabaseInit()
	MailInit()

	code := m.Run()
	os.Exit(code)
}
