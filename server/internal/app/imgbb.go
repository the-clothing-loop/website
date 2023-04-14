package app

import (
	"errors"
	"io"

	"github.com/gin-gonic/gin"
	imgbb "github.com/the-clothing-loop/go-imgbb"
)

func ImgBBupload(c *gin.Context) (imgRes *imgbb.ImgbbResponse, err error) {
	if Config.IMGBB_KEY == "" {
		return nil, errors.New("Api key to found")
	}

	b, err := io.ReadAll(c.Request.Body)
	if err != nil {
		return nil, err
	}
	bStr := string(b[:])
	// b64 := base64.StdEncoding.EncodeToString(b)

	image, err := imgbb.Upload(Config.IMGBB_KEY, bStr)
	if err != nil {
		return nil, err
	}
	return image, nil
}
