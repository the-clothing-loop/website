package tsp

func RunOptimizeRouteWithCitiesMST[K ~int | string | uint](cities []City[K]) (orderedKeys []K, minimalCost float64) {
	t := &Tsp[K]{
		Cities: cities,
	}
	distanceMatrix := t.CreateDistanceMatrix()
	minimalCost, optimalPath := OptimizeRouteMST(distanceMatrix)
	// obtaining the key of the cities based in their index in the optimalPath
	orderedKeys = t.SortCitiesByOptimalPath(optimalPath)
	return orderedKeys, minimalCost
}

func RunAddOptimalOrderNewCity[K ~int | string | uint](cities []City[K], key K) (orderedKeys []K, newCityOptimalOrder int) {
	t := &Tsp[K]{
		Cities: cities,
	}
	return t.GetRouteOrderWithNewCity(key)
}
