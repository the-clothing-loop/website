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
	chain, user0, token1 := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{IsChainAdmin: true, RoutePrivacy: &route_privacy, RouteOrderIndex: 3})

	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 1})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4})
	user4, token4 := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 5})
	user5, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 6})
	user6, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 7, IsChainAdmin: true})

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
			assert.Equal(t, expectedUser.UID, actualUser.UID)

			// The address, Phone and Number of all users should be *** except for users 2 and 3. Also, 6 because it is admin and 0 because it is the logged user
			if index != 3 /* one before me */ &&
				index != 4 /* me */ &&
				index != 5 /* one after me */ &&
				index != 0 && index != 6 /* hosts */ {
				assert.Equal(t, "***", actualUser.Email.String)
				assert.Equal(t, "***", actualUser.PhoneNumber)
				assert.Equal(t, "***", actualUser.Address)
			} else {
				assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
				assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
				if index != 0 && index != 6 { // cant see chain admin address
					assert.Equal(t, expectedUser.Address, actualUser.Address)
				} else {
					assert.Equal(t, "***", actualUser.Address)
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
			assert.Equal(t, expectedUser.UID, actualUser.UID)
			assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
			assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
			assert.Equal(t, expectedUser.Address, actualUser.Address)
		}
	})
}

func TestUserGetAllOfChainRoutePrivacyOverflowCase(t *testing.T) {

	route_privacy := 2

	// logged user
	chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1})

	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4})
	user4, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 5})
	user5, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 6})
	user6, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 7})

	expectedUsers := []*models.User{user, user1, user2, user3, user4, user5, user6}

	url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
	c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

	controllers.UserGetAllOfChain(c)
	result := resultFunc()
	actualUsers := &[]*models.User{}
	json.Unmarshal([]byte(result.Body), actualUsers)

	for index, actualUser := range *actualUsers {
		expectedUser := expectedUsers[index]
		assert.Equal(t, expectedUser.UID, actualUser.UID)

		// testing Route Privacy. The address, Phone and Number of all users should be *** except for users 1,2 and 5,6. Also, 0 because it is the logged user
		if index != 0 && index != 1 && index != 2 && index != 5 && index != 6 {
			assert.Equal(t, "***", actualUser.Email.String)
			assert.Equal(t, "***", actualUser.PhoneNumber)
			assert.Equal(t, "***", actualUser.Address)
		} else {
			assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
			assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
			assert.Equal(t, expectedUser.Address, actualUser.Address)
		}
	}
}

func TestUserGetAllOfChainRoutePrivacySmallChain(t *testing.T) {

	route_privacy := 2

	// logged user
	chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1})
	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2})

	t.Run("two users", func(t *testing.T) {
		expectedUsers := []*models.User{user, user1}

		url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

		controllers.UserGetAllOfChain(c)
		result := resultFunc()
		actualUsers := &[]*models.User{}
		json.Unmarshal([]byte(result.Body), actualUsers)

		for index, actualUser := range *actualUsers {
			expectedUser := expectedUsers[index]
			assert.Equal(t, expectedUser.UID, actualUser.UID)
			assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
			assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
			assert.Equal(t, expectedUser.Address, actualUser.Address)
		}
	})

	t.Run("three users", func(t *testing.T) {
		user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3})
		expectedUsers := []*models.User{user, user1, user2}

		url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

		controllers.UserGetAllOfChain(c)
		result := resultFunc()
		actualUsers := &[]*models.User{}
		json.Unmarshal([]byte(result.Body), actualUsers)

		for index, actualUser := range *actualUsers {
			expectedUser := expectedUsers[index]
			assert.Equal(t, expectedUser.UID, actualUser.UID)
			assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
			assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
			assert.Equal(t, expectedUser.Address, actualUser.Address)
		}
	})
}

func TestUserGetAllOfChainRoutePrivacyPausedUsers(t *testing.T) {

	route_privacy := 1

	// logged user
	chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1})

	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2, IsNotActive: true})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3, IsNotActive: true})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4})
	user4, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 5})
	user5, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 6})
	user6, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 7, IsNotActive: true})

	expectedUsers := []*models.User{user, user1, user2, user3, user4, user5, user6}

	url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
	c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

	controllers.UserGetAllOfChain(c)
	result := resultFunc()
	actualUsers := &[]*models.User{}
	json.Unmarshal([]byte(result.Body), actualUsers)

	for index, actualUser := range *actualUsers {
		expectedUser := expectedUsers[index]
		assert.Equal(t, expectedUser.UID, actualUser.UID)

		if index != 0 && // the logged user
			index != 3 && // first not paused forward user
			index != 5 { // first not paused backward user
			assert.Equal(t, "***", actualUser.Email.String)
			assert.Equal(t, "***", actualUser.PhoneNumber)
			assert.Equal(t, "***", actualUser.Address)
		} else {
			assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
			assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
			assert.Equal(t, expectedUser.Address, actualUser.Address)
		}
	}
}

func TestUserGetAllOfChainRoutePrivacyEqual0(t *testing.T) {

	route_privacy := 0

	// logged user
	chain, user, token := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1})
	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3, IsChainAdmin: true})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4})

	expectedUsers := []*models.User{user, user1, user2, user3}

	url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
	c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

	controllers.UserGetAllOfChain(c)
	result := resultFunc()
	actualUsers := &[]*models.User{}
	json.Unmarshal([]byte(result.Body), actualUsers)

	for index, actualUser := range *actualUsers {
		expectedUser := expectedUsers[index]
		assert.Equal(t, expectedUser.UID, actualUser.UID)

		// testing Route Privacy. The address, Phone and Number of all users should be *** except for users 2 because is admin, 0 because it is the logged user
		if index != 0 && index != 2 {
			assert.Equal(t, "***", actualUser.Email.String)
			assert.Equal(t, "***", actualUser.PhoneNumber)
			assert.Equal(t, "***", actualUser.Address)
		} else {
			assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
			assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
			if index != 2 { // cant see chain admin address
				assert.Equal(t, expectedUser.Address, actualUser.Address)
			} else {
				assert.Equal(t, "***", actualUser.Address)
			}
		}
	}
}

func TestUserGetAllOfChainRoutePrivacyEqualMinusOne(t *testing.T) {

	route_privacy := -1

	// logged user
	chain, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1})
	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2})
	user2, token := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3, IsChainAdmin: true})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4})

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
		assert.Equal(t, expectedUser.UID, actualUser.UID)
		assert.Equal(t, expectedUser.Email.String, actualUser.Email.String)
		assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
		assert.Equal(t, expectedUser.Address, actualUser.Address)
	}
}
