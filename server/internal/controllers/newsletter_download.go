package controllers

import (
	// "net/http"

	"github.com/gin-gonic/gin"
	// "github.com/the-clothing-loop/website/server/internal/app"
	// "github.com/the-clothing-loop/website/server/internal/app/auth"
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
	// Check if user is authenticated and authorized to upload a file. 
	// replace the existing file with the new one. Or place it if empty
	c.Status(501) // HTTP 501 Not Implemented
}

func NewsletterDownloadDelete(c *gin.Context) {
	// Check if user is authenticated and authorized to delete a file.
	// Delete the file.
	c.Status(501) // HTTP 501 Not Implemented
}