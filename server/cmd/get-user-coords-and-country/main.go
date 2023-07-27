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

func main() {
	mbToken := flag.String("mb-token", "", "mapbox api token")
	startflag := flag.Int("start", 1, "start of user_ids to check")
	endflag := flag.Int("end", 1, "end of user_ids to check")
	flag.Parse()

	os.Setenv("SERVER_NO_MIGRATE", "true")
	app.ConfigInit(".")
	db := app.DatabaseInit()

	users := []models.User{}
	db.Raw("SELECT * FROM users WHERE id >= ? AND id <= ?", *startflag, *endflag).Scan(&users)
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
			res, err := httpClient.Get(fmt.Sprintf("https://api.mapbox.com/geocoding/v5/mapbox.places/%s.json?types=address&language=en&access_token=%s", url.QueryEscape(user.Address), *mbToken))

			if err != nil {
				fmt.Printf("[%d] HTTP client returned error: %e\n", user.ID, err)
				return
			}

			decoder := json.NewDecoder(res.Body)

			var geoObjectCollection GeoObjectCollection
			if err := decoder.Decode(&geoObjectCollection); err != nil {
				fmt.Printf("[%d] Error parsing JSON: %e\n", user.ID, err)
				return
			}

			if len(geoObjectCollection.Features) > 0 {
				if len(geoObjectCollection.Features[0].Geometry.Coordinates) > 0 {
					fmt.Printf("[%d] Found result Lon: % 10f Lat: % 10f Address: %s\n",
						user.ID,
						geoObjectCollection.Features[0].Geometry.Coordinates[0],
						geoObjectCollection.Features[0].Geometry.Coordinates[1],
						strings.ReplaceAll(user.Address, "\n", " "),
					)
					user.Longitude = geoObjectCollection.Features[0].Geometry.Coordinates[0]
					user.Latitude = geoObjectCollection.Features[0].Geometry.Coordinates[1]
					db.Save(&user)
				}
			} else {
				fmt.Printf("[%d] Found no results for address %s\n", user.ID, strings.ReplaceAll(user.Address, "\n", " "))
			}
		} else {
			fmt.Printf("[%d] Skipped address %s, since there's already coords set\n", user.ID, strings.ReplaceAll(user.Address, "\n", " "))
		}
	}
}
