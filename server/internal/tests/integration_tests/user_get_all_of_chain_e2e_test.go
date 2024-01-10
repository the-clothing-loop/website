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

func TestUserGetAllOfChainRoutePrivacyHost(t *testing.T) {

	route_privacy := 1

	// logged user
	chain, user0, token1 := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 3, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 1, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user4, token4 := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 5, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user5, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 6, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user6, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 7, IsChainAdmin: true, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

	expectedUsers := []*models.User{user0, user1, user2, user3, user4, user5, user6}

	t.Run("basicCase", func(t *testing.T) {
		url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token4)

		controllers.UserGetAllOfChain(c)
		result := resultFunc()
		actualUsers := &[]*models.User{}
		json.Unmarshal([]byte(result.Body), actualUsers)

		for index, actualUser := range *actualUsers {
			expectedUser := expectedUsers[index]
			assert.Equal(t, actualUser.UID, expectedUser.UID)

			// The address, Phone and Number of all users should be *** except for users 2 and 3. Also, 6 because it is admin and 0 because it is the logged user
			if index != 3 /* one before me */ &&
				index != 4 /* me */ &&
				index != 5 /* one after me */ &&
				index != 0 /* host */ {
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
	})

	t.Run("hosts should be able to see all information", func(t *testing.T) {
		url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token1)

		controllers.UserGetAllOfChain(c)
		result := resultFunc()
		actualUsers := &[]*models.User{}
		json.Unmarshal([]byte(result.Body), actualUsers)

		for index, actualUser := range *actualUsers {
			expectedUser := expectedUsers[index]
			assert.Equal(t, actualUser.UID, expectedUser.UID)

			// The address, Phone and Number of all users should be *** except for users 2 and 3. Also, 6 because it is admin and 0 because it is the logged user

			assert.NotEqual(t, actualUser.Email.String, "***")
			assert.NotEqual(t, actualUser.PhoneNumber, "***")
			assert.NotEqual(t, actualUser.Address, "***")
		}
	})
}

func TestUserGetAllOfChainRoutePrivacyOverflowCase(t *testing.T) {

	route_privacy := 2

	// logged user
	chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user4, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 5, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user5, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 6, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user6, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 7, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

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

		// testing Route Privacy. The address, Phone and Number of all users should be *** except for users 1,2 and 5,6. Also, 0 because it is the logged user
		if index != 0 && index != 1 && index != 2 && index != 5 && index != 6 {
			assert.Equal(t, actualUser.Email.String, "***")
			assert.Equal(t, actualUser.PhoneNumber, "***")
			assert.Equal(t, actualUser.Address, "***")
		} else {
			assert.Equal(t, actualUser.Email.String, expectedUser.Email.String)
			assert.Equal(t, actualUser.PhoneNumber, expectedUser.PhoneNumber)
			assert.Equal(t, actualUser.Address, expectedUser.Address)
		}
	}
}

func TestUserGetAllOfChainRoutePrivacyEqual0(t *testing.T) {

	route_privacy := 0

	// logged user
	chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3, IsChainAdmin: true, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

	expectedUsers := []*models.User{user, user1, user2, user3}

	url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
	c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

	controllers.UserGetAllOfChain(c)
	result := resultFunc()
	actualUsers := &[]*models.User{}
	json.Unmarshal([]byte(result.Body), actualUsers)

	for index, actualUser := range *actualUsers {
		expectedUser := expectedUsers[index]
		assert.Equal(t, actualUser.UID, expectedUser.UID)

		// testing Route Privacy. The address, Phone and Number of all users should be *** except for users 2 because is admin, 0 because it is the logged user
		if index != 0 && index != 2 {
			assert.Equal(t, actualUser.Email.String, "***")
			assert.Equal(t, actualUser.PhoneNumber, "***")
			assert.Equal(t, actualUser.Address, "***")
		} else {
			assert.Equal(t, actualUser.Email.String, expectedUser.Email.String)
			assert.Equal(t, actualUser.PhoneNumber, expectedUser.PhoneNumber)
			if index != 2 { // cant see chain admin address
				assert.Equal(t, actualUser.Address, expectedUser.Address)
			} else {
				assert.Equal(t, actualUser.Address, "***")
			}
		}
	}
}

func TestUserGetAllOfChainRoutePrivacyEqualMinusOne(t *testing.T) {

	route_privacy := -1

	// logged user
	chain, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user2, token := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3, IsChainAdmin: true, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4, OverrideLatitude: new(float64), OverrideLongitude: new(float64)})

	expectedUsers := []*models.User{user, user1, user2, user3}

	url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
	c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

	controllers.UserGetAllOfChain(c)
	result := resultFunc()
	actualUsers := &[]*models.User{}
	json.Unmarshal([]byte(result.Body), actualUsers)

	// testing Route Privacy. The user should see all participants
	for index, actualUser := range *actualUsers {
		expectedUser := expectedUsers[index]
		assert.Equal(t, actualUser.UID, expectedUser.UID)
		assert.Equal(t, actualUser.Email.String, expectedUser.Email.String)
		assert.Equal(t, actualUser.PhoneNumber, expectedUser.PhoneNumber)
		assert.Equal(t, actualUser.Address, expectedUser.Address)
	}
}
