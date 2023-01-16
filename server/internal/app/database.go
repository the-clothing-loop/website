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
	if db.Migrator().HasTable("user_tokens") {
		columnTypes, err := db.Migrator().ColumnTypes("user_tokens")
		if err == nil {
			for _, ct := range columnTypes {
				if ct.Name() == "created_at" {
					t, _ := ct.ColumnType()
					if t == "bigint(20)" {
						tx := db.Begin()

						err := tx.Exec(`ALTER TABLE user_tokens ADD new_created_at datetime(3) DEFAULT NULL`)
						if err != nil {
							tx.Rollback()
							break
						}
						err = tx.Exec(`UPDATE user_tokens SET new_created_at = FROM_UNIXTIME(created_at)`)
						if err != nil {
							tx.Rollback()
							break
						}
						err = tx.Exec(`ALTER TABLE user_tokens DROP created_at`)
						if err != nil {
							tx.Rollback()
							break
						}
						err = tx.Exec(`ALTER TABLE user_tokens RENAME COLUMN new_created_at TO created_at`)
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

	db.AutoMigrate(
		&models.Chain{},
		&models.Mail{},
		&models.Newsletter{},
		&models.User{},
		&models.UserToken{},
		&models.UserChain{},
		&models.Payment{},
	)

	if !db.Migrator().HasConstraint("user_chains", "uci_user_id_chain_id") {
		db.Exec(`
ALTER TABLE user_chains
ADD CONSTRAINT uci_user_id_chain_id
UNIQUE (user_id, chain_id)
		`)
	}
}
