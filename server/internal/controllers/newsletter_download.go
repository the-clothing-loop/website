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
)

func NewsletterDownloadGet(c *gin.Context) {
	filePath := path.Join(app.Config.IMAGES_DIR, "newsletter.pdf")
	
	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.Status(http.StatusNotFound)
		return
	}
	
	// Set appropriate headers for PDF download
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=newsletter.pdf")
	
	// Serve the file
	c.File(filePath)
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

func NewsletterDownloadDelete(c *gin.Context) {
	db := getDB(c)
	ok, _, _ := auth.Authenticate(c, db, auth.AuthState4RootUser, "")
	
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}
	
	filePath := path.Join(app.Config.IMAGES_DIR, "newsletter.pdf")
	
	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.Status(http.StatusNotFound)
		return
	}
	
	// Delete the file
	err := os.Remove(filePath)
	if err != nil {
		c.String(http.StatusInternalServerError, "Unable to delete file: %v", err)
		return
	}
	
	c.Status(http.StatusOK)
}