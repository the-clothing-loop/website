package controllers

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"

	"github.com/cloudinary/cloudinary-go"
	"github.com/cloudinary/cloudinary-go/api/uploader"
	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app/goscope"
	"github.com/the-clothing-loop/website/server/pkg/imgbb"
)

type ImageUploadResponse struct {
	Delete    string `json:"delete"`
	Thumbnail string `json:"thumbnail"`
	Image     string `json:"image"`
}

func imgBBupload(c *gin.Context, size int, expiration int) (imgRes *ImageUploadResponse, err error) {
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

	cld, err := cloudinary.NewFromParams("dr5iag9id", "532794798513218", app.Config.IMGBB_KEY)
	if err != nil {
		return nil, fmt.Errorf("Unable to setup Cloudinary: %v", err)
	}
	resUpload, err := cld.Upload.Upload(c.Request.Context(), buf, uploader.UploadParams{
		DiscardOriginalFilename: true,
		UniqueFilename:          true,
		Folder:                  "upload",
	})
	if err != nil {
		return nil, fmt.Errorf("Unable to upload to Cloudinary: %v", err)
	}

	res := &ImageUploadResponse{
		Delete:    "",
		Thumbnail: "",
		Image:     "",
	}
	{
		my_image, err := cld.Image(resUpload.PublicID)
		if err != nil {
			return nil, fmt.Errorf("Unable to create Cloudinary image from public id: %v", err)
		}
		res.Image, err = my_image.String()
		if err != nil {
			return nil, fmt.Errorf("Unable to create Cloudinary image url: %v", err)
		}
	}
	{
		my_image, err := cld.Image(resUpload.PublicID)
		if err != nil {
			return nil, fmt.Errorf("Unable to create Cloudinary image from public id: %v", err)
		}
		my_image.Transformation = "c_fill,h_180,w_180"
		res.Thumbnail, err = my_image.String()
		if err != nil {
			return nil, fmt.Errorf("Unable to create Cloudinary image url: %v", err)
		}
	}

	return res, nil
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

	c.JSON(http.StatusOK, res)
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
