package main

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/CollActionteam/clothing-loop/server/cmd/spreadsheet-migrate/local"
	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/samber/lo"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

func main() {
	err := run()
	if err != nil {
		local.Log.Error("%s", err)
		os.Exit(1)
	}
}

func run() error {
	// read config for database
	app.ConfigInit(".")

	local.Log.Info("Setup environment in: %s", app.Config.ENV)

	// set database
	db := app.DatabaseInit()

	// test database
	totalChains := 0
	newChainAdminEmails := []string{}
	err := db.Raw(`
SELECT COUNT(chains.id)
FROM chains
WHERE chains.published = ?
	`, true).Scan(&totalChains).Error
	if err != nil {
		return err
	}
	local.Log.Info("database works")
	local.Log.Info("totalChains: %v", totalChains)

	// skip createdAt/updatedAt/deletedAt auto changes
	db.Config.SkipDefaultTransaction = true

	// read backup.json file
	data, err := local.ReadMigrationFile()
	if err != nil {
		return err
	}

	// migrations
	local.Log.Info("Consume data from spreadsheet -- start")
	dataChains := []*local.DataChain{}
	for i := range data.Sheets {
		d := data.Sheets[i]
		if d.Name == "Initiatiefnemers" {
			continue
		}
		c, ok := local.MigrateChainAndChainAdminUser(d)
		if !ok {
			continue
		}
		dataChains = append(dataChains, c)
	}
	local.Log.Info("Consume data from spreadsheet -- done")

	local.Log.Info("Collect changes required per spreadsheet -- start")
	for _, dc := range dataChains {
		local.Log.Info("Collect changes required per spreadsheet -- %s -- begin", dc.Name)
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

				possiblyAlikeUsers := []models.User{}
				db.Raw(`
SELECT users.*
FROM users
WHERE users.name LIKE ?
				`, fmt.Sprintf("%%%s%%", user.Name)).Scan(&possiblyAlikeUsers)
				local.Log.Warn("user is created '%s'\t'%s'\t%+v", du.Email, du.Name, du)
				if len(possiblyAlikeUsers) > 0 {
					local.Log.Error("user (ID: %d) may be related one of these users:\n%+v", user.ID, strings.Join(lo.Map(possiblyAlikeUsers, func(pu models.User, i int) string {
						return fmt.Sprintf("\tID: %d\tName: %s\tEmail: %s\tAddress: %s", pu.ID,
							pu.Name,
							pu.Email.String,
							pu.Address)
					}), "\n"))
				}

				if i == 0 && email.Valid {
					newChainAdminEmails = append(newChainAdminEmails, email.String)
				}
			} else {
				// is an existing user
				shouldChangePhoneNumber := user.PhoneNumber == "" && du.PhoneNumber != ""
				shouldChangeAddress := user.Address == "" && du.Address != ""
				if shouldChangeAddress || shouldChangePhoneNumber {
					if shouldChangePhoneNumber {
						user.PhoneNumber = du.PhoneNumber
					}

					if shouldChangeAddress {
						user.Address = du.Address
					}
					db.Save(&user)
				}

				local.Log.Trace("found user '%s'\t%+v", du.Email, du)
			}

			if i == 0 {
				if dc.UID != "" {
					db.Raw(`
SELECT chains.*
FROM chains
WHERE uid = ?
LIMIT 1
					`, dc.UID).Scan(&chain)
				}
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
					local.Log.Warn("chain %s is created", dc.Name)
				} else {
					local.Log.Trace("found chain %s", dc.Name)
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
		local.Log.Info("Collect changes required per spreadsheet -- %s -- done", dc.Name)

		time.Sleep(time.Millisecond * 300)
	}
	local.Log.Info("Collect changes required per spreadsheet -- done")

	local.Log.Info("%d  imported", len(dataChains))

	local.Log.Debug("New Chain Admin Emails:\t%s", strings.Join(newChainAdminEmails, ", "))

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
			local.Log.Error("user (id: %d) or chain (id: %d) was not found, to set isChainAdmin as %v\t%+v", d.UserID, d.ChainID, d.IsChainAdmin, res)
		}
	}
}
