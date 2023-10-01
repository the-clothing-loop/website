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

// TODO: change back to testing all languages after next crowdin PR
// var languages = []string{"en", "nl"}
var languages = []string{"en"}

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

func TestEmailAccountDeletedSuccessfully(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailAccountDeletedSuccessfully(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
		)
		assert.Nil(t, err)
	})
}

func TestEmailAnAdminApprovedYourJoinRequest(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailAnAdminApprovedYourJoinRequest(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
		)
		assert.Nil(t, err)
	})
}

func TestEmailAnAdminDeniedYourJoinRequest(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {

		reasons := []string{"other", "too_far_away", "sizes_genders"}
		for _, reason := range reasons {
			err := views.EmailAnAdminDeniedYourJoinRequest(db, lng,
				lng+" "+faker.Person().Name(),
				faker.Person().Contact().Email,
				faker.Company().Name(),
				reason,
			)
			assert.Nil(t, err)
		}
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

func TestEmailContactReceived(t *testing.T) {
	err := views.EmailContactReceived(db,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.Lorem().Paragraph(2),
	)
	assert.Nil(t, err)
}

func TestEmailDoYouWantToBeHost(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailDoYouWantToBeHost(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
		)
		assert.Nil(t, err)
	})
}

func TestEmailIsYourLoopStillActive(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailIsYourLoopStillActive(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
			faker.Person().Name(),
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

func TestEmailLoopIsDeleted(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailLoopIsDeleted(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
		)
		assert.Nil(t, err)
	})
}

func TestEmailPoke(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailPoke(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Person().Name(),
			faker.Person().Name(),
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

func TestEmailSomeoneIsInterestedInJoiningYourLoop(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailSomeoneIsInterestedInJoiningYourLoop(db, lng,
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

func TestEmailSomeoneLeftLoop(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailSomeoneLeftLoop(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
			faker.Person().Name(),
		)
		assert.Nil(t, err)
	})
}

func TestEmailSomeoneWaitingToBeAccepted(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailSomeoneWaitingToBeAccepted(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
			faker.Person().Name(),
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

func TestEmailYouSignedUpForLoop(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailYouSignedUpForLoop(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
		)
		assert.Nil(t, err)
	})
}

func TestEmailYourLoopDeletedNextMonth(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailYourLoopDeletedNextMonth(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
			faker.UUID().V4(),
		)
		assert.Nil(t, err)
	})
}

func TestEmailYourLoopDeletedNextWeek(t *testing.T) {
	runOnAllLanguages(t, func(t *testing.T, c *gin.Context, lng string) {
		err := views.EmailYourLoopDeletedNextWeek(db, lng,
			lng+" "+faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
			faker.UUID().V4(),
		)
		assert.Nil(t, err)
	})
}
