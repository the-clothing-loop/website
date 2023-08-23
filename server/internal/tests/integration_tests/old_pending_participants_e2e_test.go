//go:build !ci

package integration_tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestOldPendingParticipantsCloseOldChain(t *testing.T) {
	chain, host, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
		IsNotPublished:     false,
	})
	participant, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		IsNotApproved: true,
	})

	db.Exec(`
UPDATE user_chains SET created_at = (NOW() - INTERVAL 62 DAY)
WHERE chain_id = ?
	`, chain.ID)

	controllers.CronMonthly(db)

	resultChain := &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published)

	resultUserChain := &models.UserChain{}
	err = db.Raw(`SELECT * FROM user_chains WHERE chain_id = ? AND user_id = ?`, chain.ID, participant.ID).Scan(resultUserChain).Error
	assert.Nil(t, err)
	assert.True(t, resultUserChain.LastNotifiedIsUnapprovedAt.Valid, resultUserChain.LastNotifiedIsUnapprovedAt.Time)

	db.Exec(`
UPDATE user_chains SET last_notified_is_unapproved_at = (NOW() - INTERVAL 32 DAY)
WHERE chain_id = ?
	`, chain.ID)
	db.Exec(`
UPDATE users SET last_signed_in_at = (NOW() - INTERVAL 95 DAY)
WHERE id IN ?
	`, []uint{host.ID, participant.ID})

	controllers.CronMonthly(db)

	resultChain = &models.Chain{}
	err = db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.False(t, resultChain.Published, chain)
	assert.False(t, resultChain.OpenToNewMembers, chain)
}

func TestOldPendingParticipantsStopAfterEmailApproved(t *testing.T) {
	chain, _, hostToken := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
		IsNotPublished:     false,
	})
	participant, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		IsNotApproved: true,
	})

	db.Exec(`
UPDATE user_chains SET created_at = (NOW() - INTERVAL 62 DAY)
WHERE chain_id = ?
	`, chain.ID)

	// run cron
	controllers.CronMonthly(db)

	resultChain := &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published)

	resultUserChain := &models.UserChain{}
	err = db.Raw(`SELECT * FROM user_chains WHERE chain_id = ? AND user_id = ?`, chain.ID, participant.ID).Scan(resultUserChain).Error
	assert.Nil(t, err)
	assert.True(t, resultUserChain.LastNotifiedIsUnapprovedAt.Valid, resultUserChain.LastNotifiedIsUnapprovedAt.Time)

	// time elapsed
	db.Exec(`
UPDATE user_chains SET last_notified_is_unapproved_at = (NOW() - INTERVAL 32 DAY)
WHERE chain_id = ?
	`, chain.ID)

	// host approves participant
	url := "/v2/chain/approve-user"
	c, _ := mocks.MockGinContext(db, http.MethodPatch, url, &gin.H{
		"chain_uid": chain.UID,
		"user_uid":  participant.UID,
	}, hostToken)

	controllers.ChainApproveUser(c)

	// run cron again
	controllers.CronMonthly(db)

	resultChain = &models.Chain{}
	err = db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published, chain)
}

func TestOldPendingParticipantsStopAfterEmailDeleteUnapproved(t *testing.T) {
	chain, _, hostToken := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
		IsNotPublished:     false,
	})
	participant, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		IsNotApproved: true,
	})

	db.Exec(`
UPDATE user_chains SET created_at = (NOW() - INTERVAL 62 DAY)
WHERE chain_id = ?
	`, chain.ID)

	// run cron
	controllers.CronMonthly(db)

	resultChain := &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published)

	resultUserChain := &models.UserChain{}
	err = db.Raw(`SELECT * FROM user_chains WHERE chain_id = ? AND user_id = ?`, chain.ID, participant.ID).Scan(resultUserChain).Error
	assert.Nil(t, err)
	assert.True(t, resultUserChain.LastNotifiedIsUnapprovedAt.Valid, resultUserChain.LastNotifiedIsUnapprovedAt.Time)

	// time elapsed
	db.Exec(`
UPDATE user_chains SET last_notified_is_unapproved_at = (NOW() - INTERVAL 32 DAY)
WHERE chain_id = ?
	`, chain.ID)

	// host deletes approval participant
	url := fmt.Sprintf("/v2/chain/unapproved-user?chain_uid=%s&user_uid=%s&reason=%s",
		chain.UID,
		participant.UID,
		controllers.UnapprovedReasonOther,
	)
	c, resultFunc := mocks.MockGinContext(db, http.MethodDelete, url, &gin.H{}, hostToken)
	result := resultFunc()
	assert.Equalf(t, 200, result.Response.StatusCode, "body: %s auth header: %v", result.Body, c.Request.Header.Get("Authorization"))

	controllers.ChainDeleteUnapproved(c)

	resultUserChain = &models.UserChain{}
	err = db.Raw(`SELECT * FROM user_chains WHERE chain_id = ? AND user_id = ?`, chain.ID, participant.ID).Scan(resultUserChain).Error
	assert.Nil(t, err)
	assert.Empty(t, resultUserChain.ID, resultUserChain)

	// run cron again
	controllers.CronMonthly(db)

	resultChain = &models.Chain{}
	err = db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published, chain)
}

func TestOldPendingParticipantsDoNothingIn20Days(t *testing.T) {
	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
		IsNotPublished:     false,
	})
	participant, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		IsNotApproved: true,
	})

	db.Exec(`
UPDATE user_chains SET created_at = (NOW() - INTERVAL 10 DAY)
WHERE chain_id = ?
	`, chain.ID)

	controllers.CronMonthly(db)

	resultChain := &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published)

	resultUserChain := &models.UserChain{}
	err = db.Raw(`SELECT * FROM user_chains WHERE chain_id = ? AND user_id = ?`, chain.ID, participant.ID).Scan(resultUserChain).Error
	assert.Nil(t, err)
	assert.False(t, resultUserChain.LastNotifiedIsUnapprovedAt.Valid, resultUserChain.LastNotifiedIsUnapprovedAt.Time)

	db.Exec(`
UPDATE user_chains SET last_notified_is_unapproved_at = (NOW() - INTERVAL 10 DAY)
WHERE chain_id = ?
	`, chain.ID)

	controllers.CronMonthly(db)

	resultChain = &models.Chain{}
	err = db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published, chain)
	assert.True(t, resultChain.OpenToNewMembers, chain)
}

func TestOldPendingParticipantsDoNothingWithApprovedUsers(t *testing.T) {
	chain, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
		IsChainAdmin:       true,
		IsOpenToNewMembers: true,
		IsNotPublished:     false,
	})
	participant, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
		IsNotApproved: false,
	})

	db.Exec(`
UPDATE user_chains SET created_at = (NOW() - INTERVAL 62 DAY)
WHERE chain_id = ?
	`, chain.ID)

	controllers.CronMonthly(db)

	resultChain := &models.Chain{}
	err := db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published)

	resultUserChain := &models.UserChain{}
	err = db.Raw(`SELECT * FROM user_chains WHERE chain_id = ? AND user_id = ?`, chain.ID, participant.ID).Scan(resultUserChain).Error
	assert.Nil(t, err)
	assert.False(t, resultUserChain.LastNotifiedIsUnapprovedAt.Valid, resultUserChain.LastNotifiedIsUnapprovedAt.Time)

	db.Exec(`
UPDATE user_chains SET last_notified_is_unapproved_at = (NOW() - INTERVAL 32 DAY)
WHERE chain_id = ?
	`, chain.ID)

	controllers.CronMonthly(db)

	resultChain = &models.Chain{}
	err = db.Raw(`SELECT * FROM chains WHERE id = ?`, chain.ID).Scan(resultChain).Error
	assert.Nil(t, err)
	assert.True(t, resultChain.Published, chain)
	assert.True(t, resultChain.OpenToNewMembers, chain)
}
