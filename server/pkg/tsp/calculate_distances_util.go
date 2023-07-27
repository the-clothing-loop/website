package tsp

import "math"

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
	return matrix
}

func calculateDistance(user1, user2 UserChain) float64 {
	lat1 := user1.Latitude
	lon1 := user1.Longitude
	lat2 := user2.Latitude
	lon2 := user2.Longitude

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
