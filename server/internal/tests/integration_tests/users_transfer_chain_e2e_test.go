//go:build !ci

package integration_tests

import (
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestUserTransferChain(t *testing.T) {
	optionIsCopy := []bool{true, false}
	for _, isCopy := range optionIsCopy {
		t.Run("should "+lo.Ternary(isCopy, "copy", "transfer"), func(t *testing.T) {
			// mock
			chain1, host, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
				IsChainAdmin:       true,
				IsOpenToNewMembers: true,
			})
			chain2, _, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
				IsChainAdmin:       true,
				IsOpenToNewMembers: true,
			})
			participant, _ := mocks.MockUser(t, db, chain1.ID, mocks.MockChainAndUserOptions{})
			db.Create(&models.UserChain{
				UserID:       host.ID,
				ChainID:      chain2.ID,
				IsChainAdmin: true,
				IsApproved:   true,
			})

			// create gin.Context mock
			url := "/v2/user/transfer-chain"
			c, resultFunc := mocks.MockGinContext(db, http.MethodPost, url, &gin.H{
				"transfer_user_uid": participant.UID,
				"from_chain_uid":    chain1.UID,
				"to_chain_uid":      chain2.UID,
				"is_copy":           isCopy,
			}, token)

			// run sut
			controllers.UserTransferChain(c)

			// retrieve result
			result := resultFunc()

			// test
			assert.Equal(t, http.StatusOK, result.Response.StatusCode)
			valuesExist := struct {
				ExistInChain1 int `gorm:"exist_in_chain1"`
				ExistInChain2 int `gorm:"exist_in_chain2"`
			}{}
			db.Raw(`
SELECT (
	SELECT COUNT(uc1.id)
	FROM user_chains AS uc1
	WHERE uc1.user_id = ? AND uc1.chain_id = ?
) as exist_in_chain1, (
	SELECT COUNT(uc2.id)
	FROM user_chains AS uc2
	WHERE uc2.user_id = ? AND uc2.chain_id = ?
) as exist_in_chain2
	`, participant.ID, chain1.ID, participant.ID, chain2.ID).Scan(&valuesExist)

			assert.Equal(t, lo.Ternary(isCopy, 1, 0), valuesExist.ExistInChain1)
			assert.Equal(t, 1, valuesExist.ExistInChain2)
		})
	}
}
