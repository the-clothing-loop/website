package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gorm.io/gorm"
)

const (
	GeoJsonLatitude  = 1
	GeoJsonLongitude = 0
)

type GeoObject struct {
	Type      string   `json:"type"`
	PlaceType []string `json:"place_type"`
	Relevance float64  `json:"relevance"`

	Properties struct {
		Accuracy string `json:"accuracy"`
		MapboxID string `json:"mapbox_id"`
	} `json:"properties"`

	Text      string    `json:"text"`
	PlaceName string    `json:"place_name"`
	Center    []float64 `json:"center"`

	Geometry struct {
		Type        string    `json:"type"`
		Coordinates []float64 `json:"coordinates"`
	} `json:"geometry"`

	Address string `json:"address"`

	Context []struct {
		ID        string `json:"id"`
		MapboxID  string `json:"mapbox_id"`
		Text      string `json:"text"`
		Wikidata  string `json:"wikidata,omitempty"`
		ShortCode string `json:"short_code,omitempty"`
	} `json:"context"`
}

type GeoObjectCollection struct {
	Type        string      `json:"type"`
	Query       []string    `json:"query"`
	Features    []GeoObject `json:"features"`
	Attribution string      `json:"attribution"`
}

type MapkitResponse struct {
	Results []MapkitResult `json:"results"`
}
type MapkitResult struct {
	Center struct {
		Latitude  float64 `json:"lat"`
		Longitude float64 `json:"lng"`
	} `json:"center"`
	DisplayMapRegion struct {
		SouthLat float64 `json:"southLat"`
		WestLat  float64 `json:"westLat"`
		NorthLat float64 `json:"northLat"`
		EastLat  float64 `json:"eastLat"`
	} `json:"displayMapRegion"`
	Name                   string   `json:"name"`
	FormattedAddressLines  []string `json:"formattedAddressLines"`
	AdministrativeArea     string   `json:"administrativeArea"`
	Locality               string   `json:"locality"`
	PostCode               string   `json:"postCode"`
	ThoroughFare           string   `json:"thoroughFare"`
	SubThoroughFare        string   `json:"subThoroughFare"`
	FullThoroghFare        string   `json:"fullThoroFare"`
	Country                string   `json:"country"`
	CountryCode            string   `json:"countryCode"`
	GeocodeAccuracy        string   `json:"geocodeAccuracy"`
	Timezone               string   `json:"timezone"`
	TimezoneSecondsFromGmt int      `json:"timezoneSecondsFromGmt"`
	PlacecardUrl           string   `json:"placecardUrl"`
	Iso3166                struct {
		CountryCode     string `json:"countryCode"`
		SubdivisionCode string `json:"subdivisionCode"`
	} `json:"iso3166"`
}

func main() {
	mbToken := flag.String("mb-token", "", "mapbox api token")
	// startflag := flag.Int("start", 1, "start of user_ids to check")
	// endflag := flag.Int("end", 1, "end of user_ids to check")
	flag.Parse()

	os.Setenv("SERVER_NO_MIGRATE", "true")
	app.ConfigInit(".")
	db := app.DatabaseInit()

	users := []models.User{}
	db.Raw("SELECT * FROM users WHERE latitude = 0 AND longitude = 0").Scan(&users)
	fmt.Printf("Found %d users\n", len(users))

	apiCount := 0
	apiCountP := &apiCount
	defer func() {
		fmt.Printf("API count: %d\n", *apiCountP)
	}()

	httpClient := &http.Client{Timeout: 3 * time.Second}
	for _, user := range users {
		if user.Address == "" {
			fmt.Printf("[%d] Address is empty '%s'\n", user.ID, strings.ReplaceAll(user.Address, "\n", " "))
		} else if user.Latitude == 0 || user.Longitude == 0 {
			*apiCountP += 1
			lat, long, next := getLatLongFromAppleMapkit(httpClient, db, mbToken, user.Latitude, user.Longitude, user.Address, user.ID)
			if !next {
				return
			}
			if lat != 0 && long != 0 {
				user.Latitude = lat
				user.Longitude = long
				db.Exec(`UPDATE users SET longitude_migration = ?, latitude_migration = ? WHERE id = ?`, user.Longitude, user.Latitude, user.ID)
			}
		} else {
			fmt.Printf("[%d] Skipped address %s, since there's already coords set\n", user.ID, strings.ReplaceAll(user.Address, "\n", " "))
		}
	}
}

// // Retrieve data from Mapbox geolocation service
// // The token in found your the account page
// func getLatLongFromMapbox(httpClient *http.Client, db *gorm.DB, mbToken *string, inLat, inLong float64, address string, userID uint) (lat, long float64, next bool) {
// 	// Send request
// 	res, err := httpClient.Get(fmt.Sprintf("https://api.mapbox.com/geocoding/v5/mapbox.places/%s.json?types=address&language=en&access_token=%s", url.QueryEscape(address), *mbToken))

// 	if err != nil {
// 		fmt.Printf("[%d] HTTP client returned error: %e\n", userID, err)
// 		return 0, 0, false
// 	}

// 	// Retrieve the latitude and longitude
// 	decoder := json.NewDecoder(res.Body)

// 	var geoObjectCollection GeoObjectCollection
// 	if err := decoder.Decode(&geoObjectCollection); err != nil {
// 		fmt.Printf("[%d] Error parsing JSON: %e\n", userID, err)
// 		return 0, 0, false
// 	}

// 	if len(geoObjectCollection.Features) > 0 {
// 		if len(geoObjectCollection.Features[0].Geometry.Coordinates) > 0 {
// 			fmt.Printf("[%d] Found result Lat: % 10f Lon: % 10f Address: %s\n",
// 				userID,
// 				geoObjectCollection.Features[0].Geometry.Coordinates[GeoJsonLatitude],
// 				geoObjectCollection.Features[0].Geometry.Coordinates[GeoJsonLongitude],
// 				strings.ReplaceAll(address, "\n", " "),
// 			)
// 			lat = geoObjectCollection.Features[0].Geometry.Coordinates[GeoJsonLatitude]
// 			long = geoObjectCollection.Features[0].Geometry.Coordinates[GeoJsonLongitude]
// 			return lat, long, true
// 		}
// 	} else {
// 		fmt.Printf("[%d] Found no results for address %s\n", userID, strings.ReplaceAll(address, "\n", " "))
// 	}
// 	return 0, 0, true
// }

// Retrieve data from Apple's map api service
// The token is available from https://gps-coordinates.org/ see the Network tab.
func getLatLongFromAppleMapkit(httpClient *http.Client, db *gorm.DB, mbToken *string, inLat, inLong float64, address string, userID uint) (lat, long float64, next bool) {
	// Send request
	url := fmt.Sprintf("https://api.apple-mapkit.com/v1/geocode?q=%s&lang=en-GB", url.QueryEscape(address))
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", *mbToken))

	res, err := httpClient.Do(req)
	if err != nil {
		fmt.Printf("[%d] HTTP client returned error: %e\n", userID, err)
		return 0, 0, false
	}

	if res.StatusCode != 200 {
		fmt.Printf("[%d] Status code not ok returned: %d\n", userID, res.StatusCode)
		return 0, 0, false
	}

	// Retrieve the latitude and longitude
	decoder := json.NewDecoder(res.Body)

	var mapkitRes MapkitResponse
	if err := decoder.Decode(&mapkitRes); err != nil {
		fmt.Printf("[%d] Error parsing JSON: %e\n", userID, err)
		return 0, 0, false
	}

	if len(mapkitRes.Results) > 0 {
		lat = mapkitRes.Results[0].Center.Latitude
		long = mapkitRes.Results[0].Center.Longitude
		return lat, long, true
	} else {
		fmt.Printf("[%d] Found no results for address %s\n", userID, strings.ReplaceAll(address, "\n", " "))
	}
	return 0, 0, true
}
