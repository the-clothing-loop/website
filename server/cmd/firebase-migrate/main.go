package main

import (
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/CollActionteam/clothing-loop/server/cmd/firebase-migrate/local"
	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	"gorm.io/gorm"
)

type UserChainByFID struct {
	UserFID      string
	ChainFID     string
	IsChainAdmin bool
}

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
	data, err := local.ReadBackupFile()
	if err != nil {
		return err
	}

	// read auth_data.json file
	auth, err := local.ReadAuthDataFile()
	if err != nil {
		return err
	}

	// migrations
	var wg sync.WaitGroup
	mu := &sync.Mutex{}

	{
		userChainByFIDs := []*UserChainByFID{}

		wg = sync.WaitGroup{}
		chains := []*models.Chain{}
		for i := range data.Collections.Chains {
			fid := i
			d := data.Collections.Chains[fid]
			wg.Add(1)
			go func() {
				defer wg.Done()
				c, chainAdminFID := local.MigrateChain(*d, fid)

				mu.Lock()
				chains = append(chains, &c)
				if chainAdminFID != "" {
					userChainByFIDs = append(userChainByFIDs, &UserChainByFID{
						UserFID:      chainAdminFID,
						ChainFID:     c.FID.String,
						IsChainAdmin: true,
					})
				}
				mu.Unlock()
			}()
		}
		wg.Wait()
		if err := db.CreateInBatches(chains, 100).Error; err != nil {
			return fmt.Errorf("error in CreateInBatches(chains, 100): %+v", err)
		}
		log.Printf("%d chains imported", len(chains))

		wg = sync.WaitGroup{}
		users := []*models.User{}
		for i := range data.Collections.Users {
			fid := i
			d := data.Collections.Users[fid]
			wg.Add(1)
			go func() {
				defer wg.Done()
				u, chainFID, isChainAdmin := local.MigrateUser(*d, fid, data.Collections.Chains)

				mu.Lock()
				users = append(users, &u)
				if chainFID != "" {
					userChainByFIDs = append(userChainByFIDs, &UserChainByFID{
						UserFID:      u.FID.String,
						ChainFID:     chainFID,
						IsChainAdmin: isChainAdmin,
					})
				}
				mu.Unlock()
			}()
		}
		wg.Wait()
		if err := db.CreateInBatches(users, 100).Error; err != nil {
			return fmt.Errorf("error in CreateInBatches(users, 100): %+v", err)
		}
		log.Printf("%d users imported", len(users))

		// find or create

		for i := range auth.Users {
			d := auth.Users[i]
			local.MigrateAuth(db, *d)
		}
		log.Printf("%d auth.Users imported", len(auth.Users))
		for i := range userChainByFIDs {
			d := userChainByFIDs[i]
			FindOrCreateUserChains(db, *d)
		}
		log.Printf("%d user_chains imported", len(userChainByFIDs))
	}

	{
		wg = sync.WaitGroup{}
		mails := []*models.Mail{}
		for i := range data.Collections.Mail {
			fid := i
			d := data.Collections.Mail[fid]
			wg.Add(1)
			go func() {
				defer wg.Done()
				m := local.MigrateMail(*d, fid)

				mu.Lock()
				mails = append(mails, &m)
				mu.Unlock()
			}()
		}
		wg.Wait()
		if err := db.CreateInBatches(mails, 100).Error; err != nil {
			return fmt.Errorf("error in CreateInBatches(mails, 100): %+v", err)
		}
		log.Printf("%d mails imported", len(mails))
	}

	{
		wg = sync.WaitGroup{}
		payments := []*models.Payment{}
		for i := range data.Collections.Payments {
			fid := i
			d := data.Collections.Payments[fid]
			wg.Add(1)
			go func() {
				defer wg.Done()
				p := local.MigratePayment(*d, fid)

				mu.Lock()
				payments = append(payments, &p)
				mu.Unlock()
			}()
		}
		wg.Wait()
		if err := db.CreateInBatches(payments, 100).Error; err != nil {
			return fmt.Errorf("error in CreateInBatches(payments, 100): %+v", err)
		}
		log.Printf("%d payments imported", len(payments))
	}

	{
		wg = sync.WaitGroup{}
		newsletters := []*models.Newsletter{}
		for i := range data.Collections.InterestedUsers {
			fid := i
			d := data.Collections.InterestedUsers[fid]
			wg.Add(1)
			go func() {
				defer wg.Done()
				n := local.MigrateInterestedUsers(*d, fid)

				mu.Lock()
				newsletters = append(newsletters, &n)
				mu.Unlock()
			}()
		}
		wg.Wait()
		if err := db.CreateInBatches(newsletters, 100).Error; err != nil {
			return fmt.Errorf("error in CreateInBatches(newsletters, 100): %+v", err)
		}
		log.Printf("%d newsletters imported", len(newsletters))
	}

	return nil
}

func FindOrCreateUserChains(db *gorm.DB, d UserChainByFID) {
	// find
	{
		res := models.UserChain{}
		err := db.Raw(`
SELECT user_chains.*
FROM user_chains
LEFT JOIN users ON users.id = user_chains.user_id
LEFT JOIN chains ON chains.id = user_chains.chain_id
WHERE users.fid = ? AND chains.fid = ?
LIMIT 1
	`, d.UserFID, d.ChainFID).Scan(&res).Error

		if err == nil && res.ID != 0 {
			if res.IsChainAdmin != d.IsChainAdmin {
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
	WHERE users.fid = ?
	LIMIT 1 
) as user_id, (
	SELECT chains.id
	FROM chains
	WHERE chains.fid = ?
	LIMIT 1
) as chain_id
LIMIT 1
		`, d.UserFID, d.ChainFID).Scan(&res).Error

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
