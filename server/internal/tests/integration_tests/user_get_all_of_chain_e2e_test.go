//go:build !ci

package integration_tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestUserGetAllOfChain(t *testing.T) {

	// logged user
	chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: 1, RouteOrderIndex: 3, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 1, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user4, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 5, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user5, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 6, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user6, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 7, IsChainAdmin: true, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

	expectedUsers := []*models.User{user, user1, user2, user3, user4, user5, user6}

	url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
	c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

	controllers.UserGetAllOfChain(c)
	result := resultFunc()
	actualUsers := &[]*models.User{}
	json.Unmarshal([]byte(result.Body), actualUsers)

	for index, actualUser := range *actualUsers {
		expectedUser := expectedUsers[index]
		assert.Equal(t, actualUser.UID, expectedUser.UID)

		// testing Route Privacy. The address, Phone and Number of all users should be *** except for users 2 and 3. Also, 6 because it is admin and 0 because it is the logged user
		if index != 0 && index != 2 && index != 3 && index != 6 {
			assert.Equal(t, actualUser.Email.String, "***")
			assert.Equal(t, actualUser.PhoneNumber, "***")
			assert.Equal(t, actualUser.Address, "***")
		} else {
			assert.Equal(t, actualUser.Email.String, expectedUser.Email.String)
			assert.Equal(t, actualUser.PhoneNumber, expectedUser.PhoneNumber)
			if index != 6 { // cant see chain admin address
				assert.Equal(t, actualUser.Address, expectedUser.Address)
			} else {
				assert.Equal(t, actualUser.Address, "***")
			}
		}
	}
}
