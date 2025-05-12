package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/app/auth"
	"github.com/the-clothing-loop/website/server/internal/models"
	ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
)

func NewsletterDownloadGet(c *gin.Context) {
	// I need to return the URL where the newsletter is stored. (might be fast-coded, not really neccesary to make it dynamic)
}

func NewsletterDownloadPost(c *gin.Context) {
	// Check if user is authenticated and authorized to upload a file. 
	// replace the existing file with the new one. Or place it if empty

}

func NewsletterDownloadDelete(c *gin.Context) {
	// Check if user is authenticated and authorized to delete a file.
	// Delete the file.
}