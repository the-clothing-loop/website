package main

import (
	"database/sql"
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

	log.Print("Consume data from spreadsheet -- start")
	dataChains := []*local.DataChain{}
	{
		wg = sync.WaitGroup{}
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
	}
	log.Print("Consume data from spreadsheet -- done")

	log.Print("Collect changes required per spreadsheet -- start")
	for _, dc := range dataChains {
		log.Printf("Collect changes required per spreadsheet -- %s -- begin", dc.Name)
		userChains := []*models.UserChain{}
		chain := models.Chain{}
		for i, du := range dc.Users {
			user := models.User{}

			if du.Email != "" {
				db.Raw(`
SELECT users.*
FROM users
WHERE users.email = ?
LIMIT 1
				`, du.Email).Scan(&user)
			}

			if user.ID == 0 {
				// is new user
				email := sql.NullString{}
				if du.Email != "" {
					email = sql.NullString{String: du.Email, Valid: true}
				}
				user = models.User{
					UID:             uuid.NewV4().String(),
					Email:           email,
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
				db.Save(&user)
				log.Printf("⚠️ Warning user is created '%s' %+v", du.Email, du)
			} else {
				// is an existing user
				if user.PhoneNumber == "" && du.PhoneNumber != "" {
					user.PhoneNumber = du.PhoneNumber
					db.Save(&user)
				}
			}

			if i == 0 {
				db.Raw(`
SELECT chains.*
FROM chains
LEFT JOIN user_chains ON user_chains.chain_id = chains.id
WHERE users.id = ?
LIMIT 1
				`, user.ID).Scan(&chain)
				if chain.ID == 0 {
					chain = models.Chain{
						UID:              uuid.NewV4().String(),
						Name:             dc.Name,
						Description:      "",
						Address:          du.Address,
						Latitude:         0,
						Longitude:        0,
						Radius:           3,
						Published:        false,
						OpenToNewMembers: false,
						Sizes:            []string{},
						Genders:          []string{},
						CreatedAt:        time.Now(),
						UpdatedAt:        time.Now(),
					}
					db.Create(&chain)
					log.Printf("⚠️ Warning chain %s is created %+v", dc.Name, dc)
				}
			}

			// add user_chain
			userChains = append(userChains, &models.UserChain{
				UserID:       user.ID,
				ChainID:      chain.ID,
				IsChainAdmin: i == 0,
			})
		}
		for _, uc := range userChains {
			FindOrCreateUserChains(db, *uc)
		}
		log.Printf("Collect changes required per spreadsheet -- %s -- done", dc.Name)

		time.Sleep(time.Millisecond * 300)
	}
	log.Print("Collect changes required per spreadsheet -- done")

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
			if (res.IsChainAdmin != d.IsChainAdmin) && d.IsChainAdmin {
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
			log.Printf("🛑 Error user (id: %d) or chain (id: %d) was not found, to set isChainAdmin as %v\t%+v", d.UserID, d.ChainID, d.IsChainAdmin, res)
		}
	}
}
