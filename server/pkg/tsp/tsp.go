package tsp

import (
	"time"

	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"gorm.io/gorm"
)

type TSPAlgorithm interface {
	optimizeRoute(matrix [][]float64) (float64, []int)
}

type UserChain struct {
	ID           uint
	UID          string
	Latitude     float64
	Longitude    float64
	IsChainAdmin bool
	RouteOrder   int
	CreatedAt    time.Time
}

var optimizer TSPAlgorithm = MST{}

/*
Given a ChainUID return an optimized route for all the approved participant of the loop
with latitude and longitude.
*/
func OptimizeRoute(ChainID uint, db *gorm.DB) (float64, []string) {
	users := retrieveChainUsers(ChainID, db)
	distanceMatrix := createDistanceMatrix(users)
	minimalCost, optimalPath := optimizer.optimizeRoute(distanceMatrix)
	// obtaining the uid  of the users based in his index in the optimalPath
	orderedUsersId := sortUsersByOptimalPath(users, optimalPath)
	return minimalCost, orderedUsersId
}

/*
Given a ChainID and the Id of a new user returns the list of UsersUIDS of the chain
considering the addition of the new user
*/
func GetRouteOrderWithNewUser(ChainID uint, UserID uint, db *gorm.DB) ([]string, int) {

	usersOrderedByRoute := retrieveChainUsers(ChainID, db)
	nUserIndex, nUser := findUserById(usersOrderedByRoute, UserID)
	userOptimalOrder := getOptimalPositionBasedInDistance(nUser, usersOrderedByRoute)

	uids := make([]string, 0, len(usersOrderedByRoute))
	inserted := false

	for i, user := range usersOrderedByRoute {
		if i == nUserIndex {
			continue
		}
		if i == userOptimalOrder-1 {
			inserted = true
			uids = append(uids, nUser.UID)
		}
		uids = append(uids, user.UID)
	}

	// the optimal position could be the last one, so, if the user was not inserted in the for
	// is put at the end of the route
	if !inserted {
		uids = append(uids, nUser.UID)
	}

	return uids, userOptimalOrder
}

/*
Return the optimal position of a newUser in the loop based in the nearest existing user.
- The  optimal position is nearest user order + 1
*/
func getOptimalPositionBasedInDistance(newUser UserChain, chainUsers []UserChain) int {
	if newUser.Latitude == 0 || newUser.Longitude == 0 || len(chainUsers) <= 2 {
		return len(chainUsers) + 1
	}

	minimunDistance := INT_MAX
	var user UserChain
	for _, u := range chainUsers {
		if u.ID != newUser.ID {
			distance := calculateDistance(newUser, u)
			if distance < minimunDistance {
				minimunDistance = distance
				user = u
			}
		}
	}
	return user.RouteOrder + 1
}

func retrieveChainUsers(ChainID uint, db *gorm.DB) []UserChain {

	allUserChains := &[]UserChain{}

	err := db.Raw(`
	SELECT
		users.id AS id,
		users.uid AS uid,
		users.latitude AS latitude,
		users.longitude AS longitude,
		user_chains.is_chain_admin AS is_chain_admin,
		user_chains.route_order AS route_order,
		user_chains.created_at AS created_at
	FROM user_chains
	LEFT JOIN users ON user_chains.user_id = users.id
	WHERE user_chains.chain_id = ? 
	AND users.is_email_verified = TRUE 
	AND user_chains.is_approved = TRUE
	AND users.latitude <> 0 AND users.longitude <> 0 
	ORDER BY user_chains.route_order ASC`, ChainID).Scan(allUserChains).Error

	if err != nil {
		goscope.Log.Errorf("Unable to retrieve associations between a loop and its users: %v", err)
		return nil
	}
	return *allUserChains
}

func sortUsersByOptimalPath(users []UserChain, optimalPath []int) []string {
	orderedUsersId := make([]string, len(users))

	for i := 0; i < len(users); i++ {
		userIndex := optimalPath[i]
		orderedUsersId[i] = users[userIndex].UID
	}
	return orderedUsersId
}

func findUserById(users []UserChain, UserId uint) (int, UserChain) {
	var nUserIndex int
	var nUser UserChain
	for i, user := range users {
		if user.ID == UserId {
			nUserIndex = i
			nUser = user
			break
		}
	}
	return nUserIndex, nUser
}
