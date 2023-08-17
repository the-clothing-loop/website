package views

import (
	"testing"

	Faker "github.com/jaswdr/faker"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app"
)

var faker = Faker.New()

func TestEmailFormattingByLanguage(t *testing.T) {
	languages := []string{"en", "nl", "de", "fr", "es", "he", "sv", "it"}
	templates := []struct {
		Name string
		Data map[string]any
		Args []any
	}{
		{Name: "subscribed_to_newsletter", Data: map[string]any{}, Args: []any{}},
		{Name: "contact_confirmation", Data: map[string]any{}, Args: []any{}},
		{Name: "someone_is_interested_in_joining_your_loop", Data: map[string]any{}, Args: []any{}},
		{Name: "an_admin_approved_your_join_request", Data: map[string]any{}, Args: []any{}},
		{Name: "login_verification", Data: map[string]any{}, Args: []any{}},
		{Name: "an_admin_denied_your_join_request", Data: map[string]any{}, Args: []any{}},
		{Name: "register_verification", Data: map[string]any{}, Args: []any{}},
		{Name: "poke", Data: map[string]any{}, Args: []any{
			faker.Person().Name(),
			faker.Company().Name(),
		}},
		{Name: "approve_reminder", Data: map[string]any{}, Args: []any{}},
		{Name: "contact_received", Data: map[string]any{}, Args: []any{
			faker.Person().Name(),
		}},
	}

	for _, lng := range languages {
		t.Run(lng, func(t *testing.T) {
			for _, tpl := range templates {
				t.Run(tpl.Name, func(t *testing.T) {
					assert.NotNil(t, emailsTemplates[lng])

					m := &app.Mail{}
					err := emailGenerateMessage(m, lng, tpl.Name, tpl.Data, tpl.Args...)

					assert.NoError(t, err)

					assert.NotEmpty(t, m.Subject)
					assert.NotContains(t, m.Subject, "%!")

					assert.NotEmpty(t, m.Body)
					assert.NotContains(t, m.Body, "%!")
				})
			}
		})
	}
}
