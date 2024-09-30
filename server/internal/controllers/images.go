package controllers

import (
	"bytes"
	"crypto"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"golang.org/x/crypto/bcrypt"
)

type ImageUploadResponse struct {
	Delete    string `json:"delete"`
	Thumbnail string `json:"thumbnail"`
	Image     string `json:"image"`
}

func imagesRead(c *gin.Context) (imgRes *ImageUploadResponse, err error) {
	if app.Config.IMGBB_KEY == "" {
		return nil, errors.New("Api key to found")
	}

	reader := base64.NewDecoder(base64.StdEncoding, c.Request.Body)
	var reader1 bytes.Buffer
	// split reader into to io.Reader's
	reader2 := io.TeeReader(reader, &reader1)
	reader2Contents, _ := io.ReadAll(reader2)
	sha1 := crypto.SHA1.New()
	sha1.Write([]byte(reader2Contents))
	imageSha1 := base64.URLEncoding.EncodeToString(sha1.Sum(nil))
	img, err := imaging.Decode(&reader1)
	if err != nil {
		return nil, fmt.Errorf("Unable to decode image: %v", err)
	}

	imgNRGBA := imaging.Fit(img, 800, 800, imaging.Lanczos)

	buf := new(bytes.Buffer)
	err = imaging.Encode(buf, imgNRGBA, imaging.JPEG, imaging.JPEGQuality(80))
	if err != nil {
		return nil, fmt.Errorf("Unable to encode to jpeg: %v", err)
	}

	now := time.Now()

	jpgContents, _ := io.ReadAll(buf)
	filename := fmt.Sprintf("uploads/%s_%s.jpg", now.Format(time.DateOnly), imageSha1)
	slog.Debug("Writing image", "to", path.Join(app.Config.IMAGES_DIR, filename))
	err = os.WriteFile(path.Join(app.Config.IMAGES_DIR, filename), jpgContents, 0644)
	if err != nil {
		// The sha1 name manages duplicate, thus no need to error out.
		if !errors.Is(err, fs.ErrExist) {
			return nil, err
		}
	}

	bHash, _ := bcrypt.GenerateFromPassword([]byte(filename+app.Config.IMGBB_KEY), bcrypt.DefaultCost)
	key := base64.URLEncoding.EncodeToString(bHash)

	res := &ImageUploadResponse{
		Thumbnail: fmt.Sprintf("https://images.clothingloop.org/400x/%s", filename),
		Image:     fmt.Sprintf("https://images.clothingloop.org/original/%s", filename),
		Delete:    fmt.Sprintf("%s/v2/image_purge?path=%s&key=%s", app.Config.SITE_BASE_URL_API, filename, key),
	}
	return res, nil
}
func ImageUpload(c *gin.Context) {
	db := getDB(c)
	ok, _, _ := auth.Authenticate(c, db, auth.AuthState1AnyUser, "")
	if !ok {
		return
	}

	res, err := imagesRead(c)
	if err != nil {
		slog.Warn("Unable to upload image: ", "err", err)
		c.String(http.StatusBadRequest, "Unable to upload image")
		return
	}

	c.JSON(http.StatusOK, res)
}

func ImageDeleteDeprecated(c *gin.Context) {
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

	resp, err := http.DefaultClient.Get(query.Url)
	if err != nil {
		slog.Error("Unable to use default client on delete image url", "url", query.Url, "err", err)
		c.String(http.StatusInternalServerError, "Unable to use default client on delete image url")
		return
	}

	b, _ := io.ReadAll(resp.Body)
	c.JSON(http.StatusOK, map[string]any{
		"response": map[string]any{
			"status": resp.StatusCode,
			"body":   string(b),
		},
	})
}

func ImagePurge(c *gin.Context) {
	var query struct {
		Path string `form:"path" binding:"required"`
		Key  string `form:"key" binding:"required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	hash, err := base64.URLEncoding.DecodeString(query.Key)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	err = bcrypt.CompareHashAndPassword(hash, []byte(query.Path+app.Config.IMGBB_KEY))
	if err != nil {
		c.String(http.StatusUnauthorized, "Invalid key")
		slog.Error("Invalid key", "err", err)
		return
	}
	err = os.Remove(path.Join(app.Config.IMAGES_DIR, query.Path))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.String(http.StatusNotFound, "No such file or directory")
		} else if errors.Is(err, os.ErrPermission) {
			c.String(http.StatusInternalServerError, "Invalid file permissions")
		} else {
			c.String(http.StatusInternalServerError, "Unexpected error")
		}
		slog.Error("Error removing image", "err", err)
		return
	}
}
