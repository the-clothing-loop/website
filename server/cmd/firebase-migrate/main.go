package main

import (
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/CollActionteam/clothing-loop/server/cmd/firebase-migrate/local"
	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/models"
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
	data, err := local.ReadBackupFile()
	if err != nil {
		return err
	}

	// read auth_data.json file
	// auth, err := local.ReadAuthDataFile()
	// if err != nil {
	// 	return err
	// }

	// migrations
	var wg sync.WaitGroup
	// wg = sync.WaitGroup{}
	// for i := range data.Collections.Chains {
	// 	fid := i
	// 	d := data.Collections.Chains[fid]
	// 	wg.Add(1)
	// 	go func() {
	// 		defer wg.Done()
	// 		local.MigrateChain(*d, fid)
	// 	}()
	// }
	// wg.Wait()

	// wg = sync.WaitGroup{}
	// for i := range data.Collections.Users {
	// 	fid := i
	// 	d := data.Collections.Users[fid]
	// 	wg.Add(1)
	// 	go func() {
	// 		defer wg.Done()
	// 		local.MigrateUser(*d, fid, data.Collections.Chains)
	// 	}()
	// }
	// wg.Wait()

	// wg = sync.WaitGroup{}
	// for i := range data.Collections.Mail {
	// 	fid := i
	// 	d := data.Collections.Mail[fid]
	// 	wg.Add(1)
	// 	go func() {
	// 		defer wg.Done()
	// 		local.MigrateMail(*d, fid)
	// 	}()
	// }
	// wg.Wait()

	wg = sync.WaitGroup{}
	payments := []*models.Payment{}
	for i := range data.Collections.Payments {
		fid := i
		d := data.Collections.Payments[fid]
		wg.Add(1)
		go func() {
			defer wg.Done()
			p := local.MigratePayment(*d, fid)
			payments = append(payments, &p)
		}()
	}
	wg.Wait()
	if err := db.CreateInBatches(payments, 100).Error; err != nil {
		return fmt.Errorf("error in CreateInBatches(payments, 100): %+v", err)
	}
	log.Printf("%d payments imported", len(payments))

	wg = sync.WaitGroup{}
	newsletters := []*models.Newsletter{}
	for i := range data.Collections.InterestedUsers {
		fid := i
		d := data.Collections.InterestedUsers[fid]
		wg.Add(1)
		go func() {
			defer wg.Done()
			n := local.MigrateInterestedUsers(*d, fid)
			newsletters = append(newsletters, &n)
		}()
	}
	wg.Wait()
	if err := db.CreateInBatches(newsletters, 100).Error; err != nil {
		return fmt.Errorf("error in CreateInBatches(newsletters, 100): %+v", err)
	}
	log.Printf("%d newsletters imported", len(newsletters))

	return nil
}
