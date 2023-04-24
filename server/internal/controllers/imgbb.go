package controllers

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/pkg/imgbb"
)

// @param expiration (optional): Enable this if you want to force uploads to be auto deleted after certain time (in seconds 60-15552000)
func imgBBupload(c *gin.Context, size int, expiration int) (imgRes *imgbb.ImgbbResponse, err error) {
	if app.Config.IMGBB_KEY == "" {
		return nil, errors.New("Api key to found")
	}

	reader := base64.NewDecoder(base64.StdEncoding, c.Request.Body)
	img, err := imaging.Decode(reader)
	if err != nil {
		return nil, fmt.Errorf("Unable to decode image: %v", err)
	}

	imgNRGBA := imaging.Fit(img, size, size, imaging.Lanczos)

	buf := new(bytes.Buffer)
	err = imaging.Encode(buf, imgNRGBA, imaging.JPEG, imaging.JPEGQuality(80))
	if err != nil {
		return nil, fmt.Errorf("Unable to encode to jpeg: %v", err)
	}

	bStr := base64.StdEncoding.EncodeToString(buf.Bytes())
	// bStr = fmt.Sprintf("data:image/jpeg;base64,%s", bStr)
	// os.WriteFile("test.jpg", buf.Bytes(), 775)
	// os.WriteFile("test.jpg.base64", []byte(bStr), 0775)

	// c.String(http.StatusTeapot, "image", bStr)
	// fmt.Print(bStr)
	// return nil, fmt.Errorf("test")

	image, err := imgbb.Upload(app.Config.IMGBB_KEY, bStr, expiration, "")
	if err != nil {
		return nil, fmt.Errorf("Unable to upload to ImgBB: %v", err)
	}
	return image, nil
}
func ImageUpload(c *gin.Context) {
	db := getDB(c)
	var query struct {
		Size       int `form:"size" binding:"required,min=10,max=800"`
		Expiration int `form:"expiration" binding:"omitempty,min=60,max=15552000"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	res, err := imgBBupload(c, query.Size, query.Expiration)
	if err != nil {
		goscope.Log.Warningf("Unable to upload image: %v", err)
		c.String(http.StatusBadRequest, "Unable to upload image")
		return
	}

	if !res.Success {
		goscope.Log.Warningf("Unable to upload image: %+v", res)
		c.String(http.StatusBadRequest, "Unable to upload image")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"delete": res.Data.DeleteURL,
		"image":  res.Data.Image.Url,
		"thumb":  res.Data.Thumb.Url,
	})
}

func ImageDelete(c *gin.Context) {
	db := getDB(c)
	var query struct {
		Url string `form:"url" binding:"required,url"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	ok, _, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	imgbb.DeleteAll([]string{query.Url})
}
