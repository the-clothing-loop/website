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

func DatabaseAutoMigrate(db *gorm.DB) {
	db.AutoMigrate(
		&models.Chain{},
		&models.Mail{},
		&models.Newsletter{},
		&models.User{},
		&models.UserToken{},
		&models.UserChain{},
		&models.Payment{},
	)

	if !db.Migrator().HasConstraint(&models.UserChain{}, "uci_user_id_chain_id") {
		db.Exec(`
ALTER TABLE user_chains
ADD CONSTRAINT uci_user_id_chain_id
UNIQUE (user_id, chain_id)
		`)
	}
}
