package tsp

import (
	"math"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestToRadians(t *testing.T) {
	// Decimal point accuracy
	p := 1e6

	radian := toRadians(360)
	assert.Equal(t, math.Round(radian*p)/p, 6.283185)
}

func TestCalculateDistance(t *testing.T) {
	// Paris: Lat: 48.8566° N, Long: 2.3522° E.
	paris := City[string]{
		Latitude:  48.8566,
		Longitude: 2.3522,
	}
	// Krakow: Lat: 50.0647° N, Long: 19.9450° E.
	krakow := City[string]{
		Latitude:  50.0647,
		Longitude: 19.9450,
	}
	expectedDistance := 1275.6

	// Decimal point accuracy
	p := 10.0

	sut := calculateDistance(paris.Latitude, paris.Longitude, krakow.Latitude, krakow.Longitude)
	assert.Equal(t, expectedDistance, math.Round(sut*p)/p)
}
