//go:build !ci

package integration_tests

import (
	"fmt"
	"testing"

	"context"

	"github.com/the-clothing-loop/website/server/internal/app"
)

const testEmail = "test@example.com"

func TestBrevo(t *testing.T) {
	if app.Config.SENDINBLUE_API_KEY == "" {
		t.Skip("SENDINBLUE_API_KEY missing from env file")
		return
	}

	app.BrevoInit()

	fmt.Printf("Will run some tests using %s", app.Config.SMTP_SENDER)

	ctx := context.TODO()
	err := app.Brevo.CreateContact(ctx, testEmail)
	if err != nil {
		t.Error(err)
		return
	}

	err = app.Brevo.ExistsContact(ctx, testEmail)
	if err != nil {
		t.Error(err)
		return
	}

	err = app.Brevo.DeleteContact(ctx, testEmail)
	if err != nil {
		t.Error(err)
		return
	}
}
