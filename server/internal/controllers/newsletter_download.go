package controllers

import (
	"io"
	"net/http"
	"os"
	"path"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/app"
	// "github.com/the-clothing-loop/website/server/internal/models"
	// ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
)

//TODO I need to figure out how to store stuff into the database. (or am I going to use the file system?)

func NewsletterDownloadGet(c *gin.Context) {
	// authUser := useStore(authUser)
	// c.String(http.StatusOK, "Hello, %s!", authUser)
	// I need to return the URL where the newsletter is stored. (might be fast-coded, not really neccesary to make it dynamic)
	c.Status(501) // HTTP 501 Not Implemented
}

func NewsletterDownloadPatch(c *gin.Context) {
	db := getDB(c)
	ok, _, _ := auth.Authenticate(c, db, auth.AuthState4RootUser, "")
	
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}
	
	pdfContents, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.String(http.StatusBadRequest, "Unable to read file: %v", err)
		return
	}

	// Debug: log the directory path
	fmt.Printf("Writing to directory: %s\n", app.Config.IMAGES_DIR)
	
	// Ensure the directory exists (TODO: this shouldn't be needed, talk to lucian about it)
	err = os.MkdirAll(app.Config.IMAGES_DIR, 0755)
	if err != nil {
		c.String(http.StatusInternalServerError, "Unable to create directory: %v", err)
		return
	}

	err = os.WriteFile(path.Join(app.Config.IMAGES_DIR, "newsletter.pdf"), pdfContents, 0644)
	if err != nil {
		c.String(http.StatusBadRequest, "Unable to write file: %v", err)
		return
	}

	c.Status(http.StatusCreated) // HTTP 201 Created
}

func fileRead(c *gin.Context) {
	// TODO: Implement file reading logic
	c.Status(501) // HTTP 501 Not Implemented
}

func NewsletterDownloadDelete(c *gin.Context) {
	// Check if user is authenticated and authorized to delete a file.
	// Delete the file.
	c.Status(501) // HTTP 501 Not Implemented
}