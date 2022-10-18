package controllers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func getDB(c *gin.Context) *gorm.DB {
	db, ok := c.Get("DB")
	if !ok {
		panic("db is not instantiated")
	}

	return db.(*gorm.DB)
}
func MiddlewareSetDB(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("DB", db)
	}
}
