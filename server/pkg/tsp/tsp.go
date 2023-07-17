package tsp

import (
	"fmt"
	"math"
	"time"

	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"gorm.io/gorm"
)

type TSPAlgorithm interface {
	optimizeRoute(matrix [][]float64) (float64, []int)
}

type UserChain struct {
	UserID        uint
	UserUID       string
	UserLatitude  float64
	UserLongitude float64
	IsChainAdmin  bool
	CreatedAt     time.Time
}

var optimizer TSPAlgorithm = MST{}

/*
*
Given a ChainUID return an optimized route for all the approved participant of the loop
with latitude and longitude.
The start of the loop will be in the creator host?
*
*/
func OptimizeRoute(ChainID uint, db *gorm.DB) (float64, []string) {
	users := retrieveChainUsers(ChainID, db)
	distanceMatrix := createDistanceMatrix(users)
	minimalCost, optimalPath := optimizer.optimizeRoute(distanceMatrix)
	// obtaining the uid  of the users based in his index in the optimalPath
	orderedUsersId := sortUsersByOptimalPath(users, optimalPath)
	return minimalCost, orderedUsersId
}

func retrieveChainUsers(ChainID uint, db *gorm.DB) []UserChain {

	allUserChains := &[]UserChain{}

	err := db.Raw(`
	SELECT
		users.id AS user_id,
		users.uid AS user_uid,
		users.latitude AS user_latitude,
		users.longitude AS user_longitude,
		user_chains.is_chain_admin AS is_chain_admin,
		user_chains.created_at AS created_at
	FROM user_chains
	LEFT JOIN users ON user_chains.user_id = users.id
	WHERE user_chains.chain_id = ? 
	AND users.is_email_verified = TRUE 
	AND user_chains.is_approved = TRUE
	AND users.latitude <> 0 AND users.longitude <> 0  `, ChainID).Scan(allUserChains).Error

	if err != nil {
		goscope.Log.Errorf("Unable to retrieve associations between a loop and its users: %v", err)
		return nil
	}
	fmt.Println(allUserChains)
	return *allUserChains
}

func createDistanceMatrix(users []UserChain) [][]float64 {
	n := len(users)
	matrix := make([][]float64, n)

	for i := 0; i < n; i++ {
		matrix[i] = make([]float64, n)
	}

	for i := 0; i < n; i++ {
		for j := i; j < n; j++ {
			distance := calculateDistance(users[i], users[j])
			matrix[i][j] = distance
			matrix[j][i] = distance
		}
	}
	fmt.Println(matrix)
	return matrix
}

func calculateDistance(user1, user2 UserChain) float64 {
	lat1 := user1.UserLatitude
	lon1 := user1.UserLongitude
	lat2 := user2.UserLatitude
	lon2 := user2.UserLongitude

	// Calculate distance using Haversine formula
	dLat := toRadians(lat2 - lat1)
	dLon := toRadians(lon2 - lon1)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(toRadians(lat1))*math.Cos(toRadians(lat2))*math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	distance := 6371 * c // Earth's radius in kilometers

	return distance
}

func toRadians(degrees float64) float64 {
	return degrees * math.Pi / 180
}

func sortUsersByOptimalPath(users []UserChain, optimalPath []int) []string {
	orderedUsersId := make([]string, len(users))

	for i := 0; i < len(users); i++ {
		userIndex := optimalPath[i]
		orderedUsersId[i] = users[userIndex].UserUID
	}
	return orderedUsersId
}
