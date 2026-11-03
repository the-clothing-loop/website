//go:build !ci

package integration_tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
	"github.com/the-clothing-loop/website/server/sharedtypes"
)

// Exercise the chat dependency that was missing in #908, not only an empty Loop.
func TestChainDeleteWithChatDependencies(t *testing.T) {
	for _, legacyIDs := range []string{"populated", "empty", "stale"} {
		t.Run("legacy_channel_ids_"+legacyIDs, func(t *testing.T) {
			chain, host, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
				IsChainAdmin: true, OnlyEmailExampleCom: true,
			})
			other, otherHost, otherToken := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
				IsChainAdmin: true, OnlyEmailExampleCom: true,
			})
			participant, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{OnlyEmailExampleCom: true})
			mocks.MockAddUserToChain(t, db, other.ID, participant, mocks.MockChainAndUserOptions{})

			// Use the real channel controller: it sets chain_id but not chat_room_ids.
			createChannel := func(chainUID, token string, chainID uint) uint {
				c, result := mocks.MockGinContext(db, http.MethodPost, "/v2/chat/channel", &gin.H{
					"chain_uid": chainUID, "name": "Deletion regression fixture", "color": "#123456",
				}, token)
				controllers.ChatChannelCreate(c)
				require.Equal(t, http.StatusOK, result().Response.StatusCode, result().Body)
				var channel sharedtypes.ChatChannel
				require.NoError(t, db.Where("chain_id = ?", chainID).First(&channel).Error)
				return channel.ID
			}
			channelID := createChannel(chain.UID, token, chain.ID)
			otherChannelID := createChannel(other.UID, otherToken, other.ID)
			message := sharedtypes.ChatMessage{ChatChannelID: channelID, SendByUID: host.UID, Message: "Disposable fixture"}
			otherMessage := sharedtypes.ChatMessage{ChatChannelID: otherChannelID, SendByUID: otherHost.UID, Message: "Must survive"}
			require.NoError(t, db.Create(&message).Error)
			require.NoError(t, db.Create(&otherMessage).Error)
			if legacyIDs == "populated" {
				require.NoError(t, db.Exec("UPDATE chains SET chat_room_ids = ? WHERE id = ?", fmt.Sprintf("[\"%d\"]", channelID), chain.ID).Error)
			} else if legacyIDs == "stale" {
				// Even a stale ID referring to another Loop must not control deletion.
				require.NoError(t, db.Exec("UPDATE chains SET chat_room_ids = ? WHERE id = ?", fmt.Sprintf("[\"%d\"]", otherChannelID), chain.ID).Error)
			}

			bag := mocks.MockBag(t, db, chain.ID, participant.ID, mocks.MockBagOptions{})
			otherBag := mocks.MockBag(t, db, other.ID, participant.ID, mocks.MockBagOptions{})
			require.NotNil(t, bag)
			require.NotNil(t, otherBag)
			var membership sharedtypes.UserChain
			require.NoError(t, db.Where("chain_id = ? AND user_id = ?", chain.ID, participant.ID).First(&membership).Error)
			bulky := models.BulkyItem{UserChainID: membership.ID, Title: "Disposable", Message: "Deletion fixture"}
			require.NoError(t, db.Create(&bulky).Error)
			// Registered after the mock cleanups, so dependent rows are removed first on failure.
			t.Cleanup(func() {
				db.Exec("DELETE FROM chat_messages WHERE id IN ?", []uint{message.ID, otherMessage.ID})
				db.Exec("DELETE FROM chat_channels WHERE id IN ?", []uint{channelID, otherChannelID})
				db.Exec("DELETE FROM bulky_items WHERE id = ?", bulky.ID)
			})

			c, result := mocks.MockGinContext(db, http.MethodDelete, "/v2/chain?chain_uid="+chain.UID, nil, token)
			controllers.ChainDelete(c)
			response := result()
			assert.Equal(t, http.StatusOK, response.Response.StatusCode, response.Body)
			count := func(table, predicate string, args ...any) int64 {
				var n int64
				require.NoError(t, db.Table(table).Where(predicate, args...).Count(&n).Error)
				return n
			}
			assert.EqualValues(t, 0, count("chains", "id = ?", chain.ID), "target Loop remains")
			assert.EqualValues(t, 0, count("user_chains", "chain_id = ?", chain.ID), "target memberships remain")
			assert.EqualValues(t, 0, count("bags", "id = ?", bag.ID), "target bag remains")
			assert.EqualValues(t, 0, count("bulky_items", "id = ?", bulky.ID), "target bulky item remains")
			assert.EqualValues(t, 0, count("chat_channels", "id = ?", channelID), "target chat channel remains")
			assert.EqualValues(t, 0, count("chat_messages", "id = ?", message.ID), "target chat message remains")
			assert.EqualValues(t, 1, count("chains", "id = ?", other.ID), "unrelated Loop removed")
			assert.EqualValues(t, 1, count("bags", "id = ?", otherBag.ID), "unrelated bag removed")
			assert.EqualValues(t, 1, count("chat_channels", "id = ?", otherChannelID), "unrelated channel removed")
			assert.EqualValues(t, 1, count("chat_messages", "id = ?", otherMessage.ID), "unrelated message removed")
			assert.EqualValues(t, 1, count("user_chains", "chain_id = ? AND user_id = ?", other.ID, participant.ID), "shared membership removed")
			assert.EqualValues(t, 3, count("users", "id IN ?", []uint{host.ID, participant.ID, otherHost.ID}), "user account removed")
		})
	}
}
