package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
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

	app.ConfigInit(".")
	db := app.DatabaseInit()

	var users []models.User
	db.Raw("SELECT * FROM users WHERE id >= ? AND id <= ?", *startflag, *endflag).Scan(&users)
	fmt.Printf("Found %d users\n", len(users))

	for i := 0; i < len(users); i++ {
		if users[i].Latitude == 0 || users[i].Longitude == 0 {

			httpClient := &http.Client{Timeout: 3 * time.Second}
			res, err := httpClient.Get(fmt.Sprintf("https://api.mapbox.com/geocoding/v5/mapbox.places/%s.json?types=address&language=en&access_token=%s", url.QueryEscape(users[i].Address), *mbToken))

			if err != nil {
				log.Println(err)
			}

			decoder := json.NewDecoder(res.Body)

			var geoObjectCollection GeoObjectCollection
			if err := decoder.Decode(&geoObjectCollection); err != nil {
				fmt.Println("Error parsing JSON:", err)
				return
			}

			if len(geoObjectCollection.Features) > 0 {
				if len(geoObjectCollection.Features[0].Geometry.Coordinates) > 0 {
					fmt.Printf("Found result for address %s: Lon: %f Lat: %f\n",
						users[i].Address,
						geoObjectCollection.Features[0].Geometry.Coordinates[0],
						geoObjectCollection.Features[0].Geometry.Coordinates[1],
					)
					users[i].Longitude = geoObjectCollection.Features[0].Geometry.Coordinates[0]
					users[i].Latitude = geoObjectCollection.Features[0].Geometry.Coordinates[1]
				}
			} else {
				fmt.Printf("Found no results for address %s\n", strings.ReplaceAll(users[i].Address, "\n", " "))
				users[i].Longitude = -1
				users[i].Latitude = -1
			}
			db.Save(&users[i])
		} else {
			fmt.Printf("skipped address %s, since there's alreade coords set\n", strings.ReplaceAll(users[i].Address, "\n", " "))
		}
	}
}
