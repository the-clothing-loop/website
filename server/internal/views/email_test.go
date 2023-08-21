package views

import (
	"fmt"
	"html/template"
	"strconv"
	"strings"
	"testing"

	"github.com/0xch4z/selectr"
	Faker "github.com/jaswdr/faker"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app"
)

var faker = Faker.New()

func TestEmailFormattingByLanguage(t *testing.T) {
	languages := []string{"en", "nl", "de", "fr", "es", "he", "sv", "it"}
	templates := []struct {
		Name         string
		Data         map[string]any
		DataExpected []string
		Args         []any
	}{
		{
			Name: "an_admin_approved_your_join_request",
			Data: map[string]any{
				"Name":      faker.Person().Name(),
				"ChainName": faker.Company().Name(),
			},
			DataExpected: []string{"Name", "ChainName"},
			Args:         []any{},
		},
		{
			Name: "an_admin_denied_your_join_request",
			Data: map[string]any{
				"Name":      faker.Person().Name(),
				"ChainName": faker.Company().Name(),
				"Reason":    "sizes_genders",
			},
			DataExpected: []string{"Name", "ChainName"},
			Args:         []any{},
		},
		{
			Name: "an_admin_denied_your_join_request",
			Data: map[string]any{
				"Name":      faker.Person().Name(),
				"ChainName": faker.Company().Name(),
				"Reason":    "too_far_away",
			},
			DataExpected: []string{"Name", "ChainName"},
			Args:         []any{},
		},
		{
			Name: "an_admin_denied_your_join_request",
			Data: map[string]any{
				"Name":      faker.Person().Name(),
				"ChainName": faker.Company().Name(),
				"Reason":    "other",
			},
			DataExpected: []string{"Name", "ChainName"},
			Args:         []any{},
		},
		{
			Name: "approve_reminder",
			Data: map[string]any{
				"Name":    faker.Person().Name(),
				"BaseURL": faker.Internet().URL(),
				"Approvals": []any{map[string]any{
					"Name":      faker.Person().Name(),
					"ChainName": faker.Company().Name(),
				}},
			},
			DataExpected: []string{"Name", "BaseURL", "Approvals[0].Name", "Approvals[0].ChainName"},
			Args:         []any{},
		},
		{
			Name: "contact_confirmation",
			Data: map[string]any{
				"Name":    faker.Person().Name(),
				"Message": strings.Join(faker.Lorem().Words(5), " "),
			},
			DataExpected: []string{"Name", "Message"},
			Args:         []any{},
		},
		{
			Name: "contact_received",
			Data: map[string]any{
				"Name":    faker.Person().Name(),
				"Email":   faker.Person().Contact().Email,
				"Message": strings.Join(faker.Lorem().Words(5), " "),
			},
			DataExpected: []string{"Name", "Email", "Message"},
			Args:         []any{faker.Person().Name()},
		},
		{
			Name: "login_verification",
			Data: map[string]any{
				"Name":  faker.Person().Name(),
				"IsApp": true,
				"Token": strconv.Itoa(faker.IntBetween(10000000, 99999999)),
			},
			DataExpected: []string{"Name", "Token"},
			Args:         []any{},
		},
		{
			Name: "login_verification",
			Data: map[string]any{
				"Name":    faker.Person().Name(),
				"IsApp":   false,
				"BaseURL": faker.Internet().URL(),
				"Token":   strconv.Itoa(faker.IntBetween(10000000, 99999999)),
			},
			DataExpected: []string{"Name", "Token", "BaseURL"},
			Args:         []any{},
		},
		{
			Name: "poke",
			Data: map[string]any{
				"Name":            faker.Person().Name(),
				"ParticipantName": faker.Person().Name(),
				"ChainName":       faker.Company().Name(),
			},
			DataExpected: []string{"Name", "ParticipantName", "ChainName"},
			Args:         []any{faker.Person().Name(), faker.Company().Name()},
		},
		{
			Name: "register_verification",
			Data: map[string]any{
				"Name":    faker.Person().Name(),
				"BaseURL": faker.Internet().URL(),
				"Token":   strconv.Itoa(faker.IntBetween(10000000, 99999999)),
			},
			DataExpected: []string{"Name", "BaseURL", "Token"},
			Args:         []any{},
		},
		{
			Name: "someone_is_interested_in_joining_your_loop",
			Data: map[string]any{
				"Name":      faker.Person().Name(),
				"ChainName": faker.Company().Name(),
				"Participant": map[string]any{
					"Name":    faker.Person().Name(),
					"Email":   faker.Person().Contact().Email,
					"Phone":   faker.Person().Contact().Phone,
					"Address": faker.Address().Address(),
					"Sizes":   faker.UUID().V4(),
				},
			},
			DataExpected: []string{"Name", "ChainName", "Participant.Name", "Participant.Email", "Participant.Address", "Participant.Sizes"},
			Args:         []any{},
		},
		{
			Name: "subscribed_to_newsletter",
			Data: map[string]any{
				"Name": faker.Person().Name(),
			},
			DataExpected: []string{"Name"},
			Args:         []any{},
		},
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

					for _, v := range tpl.DataExpected {
						s, _ := selectr.Parse(v)
						value, err := s.Resolve(tpl.Data)
						assert.NoError(t, err, v)
						assert.Contains(t, m.Body, template.HTMLEscapeString(fmt.Sprint(value)), v)
					}
				})
			}
		})
	}
}
