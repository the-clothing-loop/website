package global

import (
	"fmt"

	"github.com/CollActionteam/clothing-loop/local/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func DatabaseInit(
	dbHost string,
	dbPort int,
	dbName string,
	dbUser string,
	dbPass string,
) {
	// refer https://github.com/go-sql-driver/mysql#dsn-data-source-name for details
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local", dbUser, dbPass, dbHost, dbPort, dbName)
	DB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Errorf("error connecting to db: %s", err))
	}

	DB.AutoMigrate(
		&models.Chain{},
		&models.CategoriesLL{},
		&models.ChainSize{},
		&models.Mail{},
		&models.Newsletter{},
		&models.UserToken{},
		&models.User{},
	)
}
