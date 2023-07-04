package app

import (
	"fmt"
	"net/http"
	"os"
	"testing"

	"gorm.io/gorm"
)

func RunTestMain(m *testing.M, dbP **gorm.DB, configPath string) {
	// remove all emails
	req, _ := http.NewRequest(http.MethodDelete, "http://localhost:8025/api/v1/messages", nil)
	_, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
		return
	}

	// setup
	ConfigTestInit(configPath)
	*dbP = DatabaseInit()
	MailInit()

	code := m.Run()
	os.Exit(code)
}
