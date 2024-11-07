package app

import (
	"os"
	"testing"

	"github.com/jaswdr/faker"
	"gorm.io/gorm"
)

var Faker = faker.New()

func RunTestMain(m *testing.M, dbP **gorm.DB, configPath string) {
	// setup
	ConfigTestInit(configPath)
	MailpitRemoveAllEmails()
	*dbP = DatabaseInit()
	MailInit()

	code := m.Run()
	os.Exit(code)
}
