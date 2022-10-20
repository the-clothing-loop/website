package main

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/CollActionteam/clothing-loop/server/cmd/spreadsheet-migrate/local"
	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

func main() {
	err := run()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func run() error {
	// read config for database
	app.ConfigInit(".")

	fmt.Printf("Setup environment in: %s\n", app.Config.ENV)

	// set database
	db := app.DatabaseInit()

	// test database
	totalChains := 0
	err := db.Raw(`
SELECT COUNT(chains.id)
FROM chains
WHERE chains.published = ?
	`, true).Scan(&totalChains).Error
	if err != nil {
		return err
	}
	fmt.Printf("database works\ntotalChains: %v\n", totalChains)

	// skip createdAt/updatedAt/deletedAt auto changes
	db.Config.SkipDefaultTransaction = true

	// read backup.json file
	data, err := local.ReadMigrationFile()
	if err != nil {
		return err
	}

	// migrations
	var wg sync.WaitGroup
	mu := &sync.Mutex{}

	wg = sync.WaitGroup{}
	dataChains := []*local.DataChain{}
	for i := range data.Sheets {
		d := data.Sheets[i]
		wg.Add(1)
		go func() {
			defer wg.Done()
			c, ok := local.MigrateChainAndChainAdminUser(d)
			if !ok {
				return
			}
			mu.Lock()
			dataChains = append(dataChains, c)
			mu.Unlock()
		}()
	}
	wg.Wait()

	for _, dc := range dataChains {
		users := []*models.User{}
		newUsers := []*models.User{}
		for _, du := range dc.Users {
			user := models.User{}
			db.Raw(`
SELECT users.*
FROM users
WHERE users.email = ?
LIMIT 1
			`, du.Email).Scan(&user)

			if user.ID == 0 {
				user = models.User{
					UID:             uuid.NewV4().String(),
					Email:           du.Email,
					IsEmailVerified: false,
					IsRootAdmin:     false,
					Name:            du.Name,
					PhoneNumber:     du.PhoneNumber,
					Address:         du.Address,
					Sizes:           []string{},
					Enabled:         true,
					CreatedAt:       time.Now(),
					UpdatedAt:       time.Now(),
				}
				newUsers = append(newUsers, &user)
			}

			users = append(users, &user)
		}

		db.Raw(`

		`)
	}

	// newsletters = lo.FindUniquesBy(newsletters, func(n *models.Newsletter) string {
	// 	return n.Email
	// })
	// if err := db.CreateInBatches(newsletters, 100).Error; err != nil {
	// 	return fmt.Errorf("error in CreateInBatches(newsletters, 100): %+v", err)
	// }
	log.Printf("%d  imported", len(dataChains))

	return nil
}

func FindOrCreateUserChains(db *gorm.DB, d models.UserChain) {
	// find
	{
		res := models.UserChain{}
		err := db.Raw(`
SELECT user_chains.*
FROM user_chains
WHERE user_chains.user_id = ? AND user_chains.chain_id = ?
LIMIT 1
	`, d.UserID, d.ChainID).Scan(&res).Error

		if err == nil && res.ID != 0 {
			if (res.IsChainAdmin != d.IsChainAdmin) && d.IsChainAdmin == true {
				res.IsChainAdmin = d.IsChainAdmin
				db.Save(res)
			}
			// else skip
			return
		}
	}

	// create
	{
		res := struct {
			UserID  uint `gorm:"column:user_id"`
			ChainID uint `gorm:"column:chain_id"`
		}{}
		err := db.Raw(`
SELECT (
	SELECT users.id
	FROM users
	WHERE users.id = ?
	LIMIT 1 
) as user_id, (
	SELECT chains.id
	FROM chains
	WHERE chains.id = ?
	LIMIT 1
) as chain_id
LIMIT 1
		`, d.UserID, d.ChainID).Scan(&res).Error

		if err == nil && res.ChainID != 0 && res.UserID != 0 {
			db.Create(&models.UserChain{
				UserID:       res.UserID,
				ChainID:      res.ChainID,
				IsChainAdmin: d.IsChainAdmin,
			})
		} else {
			log.Printf("user (fid:  %s) or chain (fid: %s) was not found, to set isChainAdmin as %v\t%+v", d.UserFID, d.ChainFID, d.IsChainAdmin, res)
		}
	}
}
