package app

import (
	"fmt"
	"os"
	"testing"

	"github.com/jaswdr/faker"
	"github.com/stretchr/testify/assert"
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

func AssertNotErrorNow(t *testing.T, err error, msgAndArgs ...any) {
	if err != nil {
		assert.FailNow(t, fmt.Sprintf("Expected nil, but got: %#v", err), msgAndArgs...)
	}
}
