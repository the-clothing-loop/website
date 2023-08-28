//go:build !ci

package integration_tests

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
	"github.com/the-clothing-loop/website/server/internal/views"
)

func TestMailEnvironment(t *testing.T) {
	assert.NotEmpty(t, app.Config.SMTP_HOST, "SMTP_HOST")
	assert.NotEmpty(t, app.Config.SMTP_USER, "SMTP_USER")
	assert.Empty(t, app.Config.SMTP_PASS, "SMTP_PASS")

	assert.Equal(t, app.EnvEnumTesting, app.Config.ENV)
}

func TestMailSend(t *testing.T) {
	m := app.MailCreate()
	m.ToName = faker.Person().Name()
	m.ToAddress = faker.Person().Contact().Email
	m.Body = strings.Join(strings.Split((faker.Lorem().Paragraph(5)), "\n"), "<br/>")
	m.Subject = strings.Join(faker.Lorem().Words(4), " ")

	app.MailSend(db, m)
}

var languages = []string{"en", "nl"}

func runOnAllLanguages(t *testing.T, run func(t *testing.T, c *gin.Context, lng string)) {
	for i := range languages {
		c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
		lng := languages[i]
		addCookieToMockGin(c, lng)

		t.Run(lng, func(t *testing.T) {
			run(t, c, lng)
		})
	}
}
func addCookieToMockGin(c *gin.Context, lng string) {
	cookie := &http.Cookie{
		Name:  "i18next",
		Value: lng,
	}
	c.Request.AddCookie(cookie)
}

func TestGetMockCookie(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")

	addCookieToMockGin(c, "nl")

	result, _ := c.Cookie("i18next")
	assert.Equal(t, "nl", result)
}

func TestEmailAParticipantJoinedTheLoop(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailAParticipantJoinedTheLoop(c, db, lng,
			faker.Person().Contact().Email,
			lng+" "+faker.Person().Name(),
			faker.Company().Name(),
			faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Person().Contact().Phone,
			faker.Address().Address(),
			[]string{models.SizeEnumWomenMedium, models.SizeEnumWomenLarge, models.SizeEnumMenSmall, models.SizeEnumBaby},
		)
		assert.Nil(t, err)
	})
}

func TestEmailContactUserMessage(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailContactUserMessage(c, db,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.Lorem().Paragraph(2),
	)
	assert.Nil(t, err)
}

func TestEmailContactConfirmation(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailContactConfirmation(c, db,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Lorem().Paragraph(2),
		)
		assert.Nil(t, err)
	})
}

func TestEmailSubscribeToNewsletter(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailSubscribeToNewsletter(c, db,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
		)
		assert.Nil(t, err)
	})
}

func TestEmailRegisterVerification(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailRegisterVerification(c, db,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.UUID().V4(),
		)
		assert.Nil(t, err)
	})
}

func TestEmailLoginVerificationWebsite(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailLoginVerification(c, db,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.UUID().V4(),
			false)
		assert.Nil(t, err)
	})
}
func TestEmailLoginVerificationApp(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailLoginVerification(c, db,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			fmt.Sprintf("%08d", faker.RandomNumber(8)),
			true)
		assert.Nil(t, err)
	})
}

func TestEmailAnAdminDeniedYourJoinRequest(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {

		reasons := []string{"other", "too_far_away", "sizes_genders"}
		for _, reason := range reasons {
			err := views.EmailAnAdminDeniedYourJoinRequest(c, db, lng,
				lng+" "+faker.Person().Name(),
				faker.Person().Contact().Email,
				faker.Company().Name(),
				reason,
			)
			assert.Nil(t, err)
		}
	})
}
func TestEmailPoke(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailPoke(c, db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Person().Name(),
			faker.Person().Name(),
		)
		assert.Nil(t, err)
	})
}
func TestEmailApproveReminder(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		approvals := []*views.EmailApproveReminderItem{
			{
				Name:        faker.Person().Name(),
				Email:       faker.Person().Contact().Email,
				ChainID:     faker.UInt(),
				UserChainID: faker.UInt(),
				ChainName:   faker.Company().Name(),
			},
			{
				Name:        faker.Person().Name(),
				Email:       faker.Person().Contact().Email,
				ChainID:     faker.UInt(),
				UserChainID: faker.UInt(),
				ChainName:   faker.Company().Name(),
			},
		}

		err := views.EmailApproveReminder(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			approvals,
		)
		assert.Nil(t, err)
	})
}
