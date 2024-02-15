package app

import (
	"fmt"
	"os"
	"time"

	cache "github.com/patrickmn/go-cache"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var Cache *cache.Cache

func DatabaseInit() *gorm.DB {
	// refer https://github.com/go-sql-driver/mysql#dsn-data-source-name for details
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local", Config.DB_USER, Config.DB_PASS, Config.DB_HOST, Config.DB_PORT, Config.DB_NAME)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Errorf("error connecting to db: %s", err))
	}

	if os.Getenv("SERVER_NO_MIGRATE") == "" {
		DatabaseAutoMigrate(db)
	}

	Cache = cache.New(5*time.Minute, 10*time.Minute)

	return db
}

func DatabaseAutoMigrate(db *gorm.DB) {
	// Remove User Tokens
	if db.Migrator().HasTable("user_tokens") {
		if db.Migrator().HasConstraint("user_tokens", "fk_users_user_token") {
			db.Exec(`ALTER TABLE user_tokens DROP FOREIGN KEY fk_users_user_token`)
		}
		db.Migrator().DropTable("user_tokens")
	}

	db.AutoMigrate(
		&models.Chain{},
		&models.Newsletter{},
		&models.User{},
		&models.Event{},
		&models.UserChain{},
		&models.UserOnesignal{},
		&models.Bag{},
		&models.BulkyItem{},
		&models.Payment{},
		&models.Mail{},
	)
}
