package services

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/the-clothing-loop/website/server/internal/models"
	ginext "github.com/the-clothing-loop/website/server/pkg/gin_ext"
	"gorm.io/gorm"
)

func ChainDelete(c *gin.Context, db *gorm.DB, chain *models.Chain) bool {
	users, err := chain.GetUserContactData(db)
	if err != nil {
		err = fmt.Errorf("chain uid: %s, err: %w", chain.UID, err)
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Unable to notify loop members, please contact us.")
		return false
	}

	err = chain.Delete(db)
	if err != nil {
		err = fmt.Errorf("chain uid: %s, err: %w", chain.UID, err)
		slog.Error("Error deleting loop:", "chainUID", chain.UID)
		ginext.AbortWithErrorInBody(c, http.StatusInternalServerError, err, "Unable to delete loop, please contact us.")
		return false
	}

	emailLoopHasBeenDeleted(db, users, chain.Name)
	return true
}
