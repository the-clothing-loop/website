package app

import (
	"fmt"
	"os"

	"github.com/CollActionteam/clothing-loop/server/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func DatabaseInit() *gorm.DB {
	// refer https://github.com/go-sql-driver/mysql#dsn-data-source-name for details
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local", Config.DB_USER, Config.DB_PASS, Config.DB_HOST, Config.DB_PORT, Config.DB_NAME)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Errorf("error connecting to db: %s", err))
	}

	if os.Getenv("SERVER_NO_MIGRATE") == "" {
		DatabaseAutoMigrate(db)
	}

	return db
}

func DatabaseAutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Chain{},
		&models.Mail{},
		&models.Newsletter{},
		&models.User{},
		&models.UserToken{},
		&models.UserChain{},
		&models.Payment{},
	)
}
