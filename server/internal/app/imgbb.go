package app

import (
	"encoding/base64"
	"errors"
	"io"

	"github.com/gin-gonic/gin"
	imgbb "github.com/mococa/go-imgbb"
)

func ImgBBupload(c *gin.Context) (imgRes *imgbb.ImgbbResponse, err error) {
	if Config.IMGBB_KEY == "" {
		return nil, errors.New("Api key to found")
	}

	r, err := c.Request.GetBody()
	if err != nil {
		return nil, err
	}

	b, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}
	b64 := base64.StdEncoding.EncodeToString(b)

	image, err := imgbb.Upload(Config.IMGBB_KEY, b64)
	if err != nil {
		return nil, err
	}
	return image, nil
}
