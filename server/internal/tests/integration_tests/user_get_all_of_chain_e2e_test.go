//go:build !ci

package integration_tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/controllers"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestUserGetAllOfChainRoutePrivacy(t *testing.T) {

	route_privacy := 1

	// logged user
	chain, user0, token0 := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{IsChainAdmin: true, RoutePrivacy: &route_privacy, RouteOrderIndex: 0})

	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 1})
	user2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 2})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 3})
	user4, token4 := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4})
	user5, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 5})
	user6, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 6, IsChainAdmin: true})
	user7, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 7})
	user8, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 8})
	user9, token9 := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 9, IsRootAdmin: true})
	user10, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 10})
	user10.PausedUntil = lo.ToPtr(time.Now().Add(1 * time.Hour))
	db.Save(user10)
	user11, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 11})

	expectedUsers := []*models.User{user0, user1, user2, user3, user4, user5, user6,
		user7,
		user8,
		user9,
		user10,
		user11,
	}

	t.Run("as host", func(t *testing.T) {
		url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token0)

		controllers.UserGetAllOfChain(c)
		result := resultFunc()
		actualUsers := &[]*models.User{}
		json.Unmarshal([]byte(result.Body), actualUsers)

		for index, actualUser := range *actualUsers {
			t.Run(fmt.Sprintf("route index %d", index), func(t *testing.T) {
				expectedUser := expectedUsers[index]
				assert.Equal(t, expectedUser.UID, actualUser.UID)

				assert.Equal(t, *expectedUser.Email, *actualUser.Email, "index %d", index)
				assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber, "index %d", index)
				assert.Equal(t, expectedUser.Address, actualUser.Address, "index %d", index)
			})
		}
	})

	t.Run("as participant", func(t *testing.T) {
		url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token4)

		controllers.UserGetAllOfChain(c)
		result := resultFunc()
		actualUsers := &[]*models.User{}
		json.Unmarshal([]byte(result.Body), actualUsers)

		for index, actualUser := range *actualUsers {
			if index == 0 {
				continue
			}
			t.Run(fmt.Sprintf("route index %d", index), func(t *testing.T) {
				expectedUser := expectedUsers[index]
				assert.NotEmpty(t, actualUser.UID)
				assert.Equal(t, expectedUser.UID, actualUser.UID, "response not ordered correctly")

				// The address, Phone and Number of all users should be *** except for users 2 and 3. Also, 6 because it is admin and 0 because it is the logged user
				switch index {
				case 3 /* one before me */, 4 /* me */, 5 /* one after me */ :
					assert.Equal(t, *expectedUser.Email, *actualUser.Email, "index %d", index)
					assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber, "index %d", index)
					assert.Equal(t, expectedUser.Address, actualUser.Address, "index %d", index)
				case 0, 6 /* hosts */ :
					assert.Equal(t, "***", actualUser.Address, "index %d", index)
					assert.Equal(t, *expectedUser.Email, *actualUser.Email, "index %d", index)
					assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber, "index %d", index)
				default:
					assert.Equal(t, "***", actualUser.Address, "index %d", index)
					assert.Equal(t, "***", *actualUser.Email, "index %d", index)
					assert.Equal(t, "***", actualUser.PhoneNumber, "index %d", index)
				}
			})
		}
	})

	t.Run("as root admin", func(t *testing.T) {
		url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
		c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token9)

		controllers.UserGetAllOfChain(c)
		result := resultFunc()
		actualUsers := &[]*models.User{}
		json.Unmarshal([]byte(result.Body), actualUsers)

		for index, actualUser := range *actualUsers {
			t.Run(fmt.Sprintf("route index %d", index), func(t *testing.T) {
				expectedUser := expectedUsers[index]
				assert.Equal(t, expectedUser.UID, actualUser.UID)

				assert.Equal(t, *expectedUser.Email, *actualUser.Email, "index %d", index)
				assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber, "index %d", index)
				assert.Equal(t, expectedUser.Address, actualUser.Address, "index %d", index)
			})
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
			assert.Equal(t, "***", *actualUser.Email)
			assert.Equal(t, "***", actualUser.PhoneNumber)
			assert.Equal(t, "***", actualUser.Address)
		} else {
			assert.Equal(t, *expectedUser.Email, *actualUser.Email)
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
			assert.Equal(t, *expectedUser.Email, *actualUser.Email)
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
			assert.Equal(t, *expectedUser.Email, *actualUser.Email)
			assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
			assert.Equal(t, expectedUser.Address, actualUser.Address)
		}
	})
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
			assert.Equal(t, "***", *actualUser.Email)
			assert.Equal(t, "***", actualUser.PhoneNumber)
			assert.Equal(t, "***", actualUser.Address)
		} else {
			assert.Equal(t, *expectedUser.Email, *actualUser.Email)
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
		assert.Equal(t, *expectedUser.Email, *actualUser.Email)
		assert.Equal(t, expectedUser.PhoneNumber, actualUser.PhoneNumber)
		assert.Equal(t, expectedUser.Address, actualUser.Address)
	}
}

func TestUserGetAllOfChainRoutePrivacyMutiple0(t *testing.T) {

	route_privacy := 2

	// logged user
	chain, user, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{RoutePrivacy: &route_privacy, RouteOrderIndex: 1})
	user1, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 1})
	user2, token := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 0, IsChainAdmin: true})
	user3, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{RouteOrderIndex: 4})

	expectedUsers := []*models.User{user, user1, user2, user3}

	url := fmt.Sprintf("/v2/user/all-chain?&chain_uid=%s", chain.UID)
	c, resultFunc := mocks.MockGinContext(db, http.MethodGet, url, nil, token)

	controllers.UserGetAllOfChain(c)
	result := resultFunc()
	actualUsers := &[]*models.User{}
	json.Unmarshal([]byte(result.Body), actualUsers)

	// testing Route Privacy. The user should see all participants

	actualUserUIDs := lo.Map(*actualUsers, func(user *models.User, _ int) string {
		return user.UID
	})
	for _, expectedUser := range expectedUsers {
		_, ok := lo.Find(*actualUsers, func(actualUser *models.User) bool {
			return actualUser.UID == expectedUser.UID
		})
		if !ok {
			assert.Failf(t, "expected user %s not in %s", strings.Join(actualUserUIDs, ", "))
		}
	}
}
