package integration_tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
	"github.com/the-clothing-loop/website/server/internal/views"
)

func TestMail(t *testing.T) {
	assert.NotEmpty(t, app.Config.SMTP_HOST, "SMTP_HOST")
	assert.NotEmpty(t, app.Config.SMTP_USER, "SMTP_USER")
	assert.Empty(t, app.Config.SMTP_PASS, "SMTP_PASS")
}

func TestEmailAParticipantJoinedTheLoop(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailAParticipantJoinedTheLoop(c,
		faker.Person().Contact().Email,
		faker.Person().Name(),
		faker.Company().Name(),
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.Person().Contact().Phone,
		faker.Address().Address(),
	)
	assert.Nil(t, err)
}

func TestEmailContactUserMessage(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailContactUserMessage(c,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.Lorem().Paragraph(2),
	)
	assert.Nil(t, err)
}

func TestEmailContactConfirmation(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailContactConfirmation(c,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.Lorem().Paragraph(2),
	)
	assert.Nil(t, err)
}

func TestEmailSubscribeToNewsletter(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailSubscribeToNewsletter(c,
		faker.Person().Name(),
		faker.Person().Contact().Email,
	)
	assert.Nil(t, err)
}

func TestEmailRegisterVerification(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailRegisterVerification(c,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.UUID().V4(),
	)
	assert.Nil(t, err)
}

func TestEmailLoginVerificationWebsite(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailLoginVerification(c,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.UUID().V4(),
		false)
	assert.Nil(t, err)
}
func TestEmailLoginVerificationApp(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailLoginVerification(c,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		fmt.Sprintf("%08d", faker.RandomNumber(8)),
		true)
	assert.Nil(t, err)
}

func TestEmailAnAdminDeniedYourJoinRequest(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")

	reasons := []string{"other", "too_far_away", "sizes_genders"}
	for _, reason := range reasons {
		err := views.EmailAnAdminDeniedYourJoinRequest(c,
			faker.Person().Name(),
			faker.Person().Contact().Email,
			faker.Company().Name(),
			reason,
		)
		assert.Nil(t, err)
	}
}
func TestEmailPoke(t *testing.T) {
	c, _ := mocks.MockGinContext(db, http.MethodGet, "/", nil, "test")
	err := views.EmailPoke(c,
		faker.Person().Name(),
		faker.Person().Contact().Email,
		faker.Person().Name(),
		faker.Person().Name(),
	)
	assert.Nil(t, err)
}
func TestEmailApproveReminder(t *testing.T) {
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

	err := views.EmailApproveReminder(
		faker.Person().Name(),
		faker.Person().Contact().Email,
		approvals,
	)
	assert.Nil(t, err)
}
