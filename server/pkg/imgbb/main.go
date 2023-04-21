package imgbb

import (
	"encoding/json"
	"fmt"
	"io"
	"strconv"

	"net/http"
	"net/url"
)

type ImgbbImage struct {
	Filename  string `json:"filename"`
	Name      string `json:"name"`
	Mime      string `json:"mime"`
	Extension string `json:"extension"`
	Url       string `json:"url"`
}

type ImgbbResponse struct {
	Data    ImgbbResponseData `json:"data"`
	Success bool              `json:"success"`
	Status  int               `json:"status"`
}

type ImgbbResponseData struct {
	ID string `json:"id"`

	DisplayURL string `json:"display_url"`
	DeleteURL  string `json:"delete_url"`

	Expiration int `json:"expiration"`

	Height int `json:"height"`
	Width  int `json:"width"`

	Image  ImgbbImage  `json:"image"`
	Medium *ImgbbImage `json:"medium,omitempty"`
	Thumb  ImgbbImage  `json:"thumb"`
}

// Uploads image to imgbb.com
//
// @param key (required): The imgBB API key.
//
// @param image (required): A binary file, base64 data, or a URL for an image. (up to 32 MB)
//
// @param name (optional): The name of the file, this is automatically detected if uploading a file with a POST and multipart / form-data
//
// @param expiration (optional): Enable this if you want to force uploads to be auto deleted after certain time (in seconds 60-15552000)
func Upload(key string, image string, expiration int, name string) (*ImgbbResponse, error) {
	v := url.Values{}
	v.Add("key", key)
	if expiration > 60 && expiration < 15552000 {
		v.Add("expiration", strconv.Itoa(expiration))
	}
	if name != "" {
		v.Add("name", name)
	}
	// Make request to ImgBB with Key and a Base64 image
	resp, err := http.PostForm("https://api.imgbb.com/1/upload?"+v.Encode(),
		url.Values(map[string][]string{
			"image": {image},
		}),
	)
	if err != nil {
		return nil, err
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Response not ok %v", string(body[:]))
	}

	// Transform response body into type
	imgbb_response := &ImgbbResponse{}

	err = json.Unmarshal(body, imgbb_response)
	if err != nil {
		return nil, err
	}

	// Close body
	defer resp.Body.Close()

	return imgbb_response, nil
}

func DeleteAll(urls []string) {
	for _, url := range urls {
		go http.Get(url)
	}
}
