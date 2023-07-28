package tsp

type Tsp[K ~int | string | uint] struct {
	// Ordered by route
	Cities []City[K]
}

type City[K ~int | string | uint] struct {
	Key        K
	RouteOrder int
	Latitude   float64
	Longitude  float64
}

func (t *Tsp[K]) SetCities(cities []City[K]) {
	t.Cities = cities
}

// It is assumed that t.Cities is provided beforehand
func (t *Tsp[K]) GetRouteOrderWithNewCity(Key K) (orderedKeys []K, newCityOptimalOrder int) {
	newCityIndex, newCity := t.findCityByKey(Key)
	newCityOptimalOrder = t.getOptimalPositionBasedInDistance(newCity, t.Cities)

	orderedKeys = make([]K, 0, len(t.Cities))
	inserted := false

	for i, city := range t.Cities {
		if i == newCityIndex {
			continue
		}
		if i == newCityOptimalOrder-1 {
			inserted = true
			orderedKeys = append(orderedKeys, newCity.Key)
		}
		orderedKeys = append(orderedKeys, city.Key)
	}

	// The optimal position could be the last one, so, if the city was not inserted in the for loop it is put at the end of the route
	if !inserted {
		orderedKeys = append(orderedKeys, newCity.Key)
	}

	return orderedKeys, newCityOptimalOrder
}

// Return the optimal position of a new City in the loop based in the nearest existing city.
//
// The optimal position is: nearest city, order + 1
func (t *Tsp[K]) getOptimalPositionBasedInDistance(newCity City[K], cities []City[K]) int {
	if newCity.Latitude == 0 || newCity.Longitude == 0 || len(cities) <= 2 {
		return len(cities) + 1
	}

	minimumDistance := INT_MAX
	var nearestCity City[K]
	for _, c := range cities {
		if c.Key != newCity.Key {
			distance := calculateDistance(newCity.Latitude, newCity.Longitude, c.Latitude, c.Longitude)
			if distance < minimumDistance {
				minimumDistance = distance
				nearestCity = c
			}
		}
	}
	return nearestCity.RouteOrder + 1
}

func (t *Tsp[K]) SortCitiesByOptimalPath(optimalPath []int) []K {
	orderedCityKeys := make([]K, len(t.Cities))

	for i := 0; i < len(t.Cities); i++ {
		index := optimalPath[i]
		orderedCityKeys[i] = t.Cities[index].Key
	}
	return orderedCityKeys
}

func (t *Tsp[K]) findCityByKey(key K) (index int, city City[K]) {
	for i, c := range t.Cities {
		if c.Key == key {
			index = i
			city = c
			break
		}
	}
	return index, city
}
