package app

import (
	"fmt"
	"log/slog"
	"os"
	"time"

	cache "github.com/patrickmn/go-cache"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var Cache *cache.Cache

func DatabaseInit() *gorm.DB {
	if Config.DB_HOST == "" {
		panic(fmt.Errorf("database is not specified in config"))
	}

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

func CacheFindOrUpdate[V any](key string, duration time.Duration, update func() (*V, error)) (*V, error) {
	if c, found := Cache.Get(key); found {
		d, ok := c.(V)
		if ok {
			return &d, nil
		}
	}

	d, err := update()
	if err != nil {
		return nil, err
	}
	Cache.Add(key, *d, duration)
	return d, nil
}

func DatabaseAutoMigrate(db *gorm.DB) {
	hadIsApprovedColumn := db.Migrator().HasColumn(&sharedtypes.UserChain{}, "is_approved")
	hadEventPriceTypeColumn := db.Migrator().HasColumn(&models.Event{}, "price_type")
	hadAllowMapColumn := db.Migrator().HasColumn(&models.Chain{}, "allow_map")

	// User Tokens
	if db.Migrator().HasTable("user_tokens") {
		columnTypes, err := db.Migrator().ColumnTypes("user_tokens")
		if err == nil {
			for _, ct := range columnTypes {
				if ct.Name() == "created_at" {
					t, _ := ct.ColumnType()
					if t == "bigint(20)" {
						tx := db.Begin()

						if !db.Migrator().HasColumn(&sharedtypes.UserToken{}, "new_created_at") {
							err := tx.Exec(`ALTER TABLE user_tokens ADD new_created_at datetime(3) DEFAULT NULL`).Error
							if err != nil {
								tx.Rollback()
								break
							}
						}
						err = tx.Exec(`UPDATE user_tokens SET new_created_at = FROM_UNIXTIME(created_at)`).Error
						if err != nil {
							tx.Rollback()
							break
						}
						err = tx.Exec(`ALTER TABLE user_tokens DROP created_at`).Error
						if err != nil {
							tx.Rollback()
							break
						}
						err = tx.Exec(`ALTER TABLE user_tokens RENAME COLUMN new_created_at TO created_at`).Error
						if err != nil {
							tx.Rollback()
							break
						}

						tx.Commit()
					}
					break
				}
			}
		}
	}
	// Bags
	if db.Migrator().HasTable("bags") {
		columnTypes, err := db.Migrator().ColumnTypes("bags")
		if err == nil {
			for _, ct := range columnTypes {
				if ct.Name() == "number" {
					t, _ := ct.ColumnType()
					if t == "bigint(20)" {
						fmt.Printf("column number found in bags")
						db.Exec(`ALTER TABLE bags MODIFY number longtext`)
					}
				}
			}
		}
	}

	// Mail removed
	if db.Migrator().HasTable("mails") {
		db.Exec(`DROP TABLE mails`)
	}

	db.AutoMigrate(
		&models.Chain{},
		&models.Newsletter{},
		&models.User{},
		&models.Event{},
		&sharedtypes.UserToken{},
		&sharedtypes.UserChain{},
		&models.UserOnesignal{},
		&models.Bag{},
		&models.BulkyItem{},
		&models.Payment{},
		&models.Mail{},
		&models.DeletedUser{},
		&sharedtypes.ChatChannel{},
		&sharedtypes.ChatMessage{},
	)

	if !db.Migrator().HasConstraint("user_chains", "uci_user_id_chain_id") {
		db.Exec(`
ALTER TABLE user_chains
ADD CONSTRAINT uci_user_id_chain_id
UNIQUE (user_id, chain_id)
		`)
	}
	if !hadEventPriceTypeColumn {
		slog.Info("Migration run: create event price type")
		db.Exec(`
UPDATE events SET price_type = CASE
	WHEN price_value = 0 THEN "free"
	ELSE "entrance"
END
WHERE price_type IS NULL
		`)
	}
	if !hadIsApprovedColumn {
		db.Exec(`
UPDATE user_chains SET is_approved = TRUE WHERE id IN (
	SELECT uc.id FROM user_chains AS uc
	LEFT JOIN users AS u ON u.id = uc.user_id
	WHERE u.is_email_verified = TRUE && uc.is_approved IS NULL 
)
		`)

		db.Exec(`
UPDATE user_chains SET is_approved = FALSE WHERE id IN (
	SELECT uc.id FROM user_chains AS uc
	LEFT JOIN users AS u ON u.id = uc.user_id
	WHERE u.is_email_verified = FALSE && uc.is_approved IS NULL 
)
		`)
	}
	if !hadAllowMapColumn {
		slog.Info("Migration run: set new allow_map column to true")
		db.Exec("UPDATE chains SET allow_map = 1")
	}

	if db.Migrator().HasColumn(&models.User{}, "chat_user") {
		db.Migrator().DropColumn(&models.User{}, "chat_user")
	}
}
