package main

import (
	"fmt"
	"os"
	"sync"

	"github.com/CollActionteam/clothing-loop/server/cmd/firebase-migrate/local"
	"github.com/CollActionteam/clothing-loop/server/local/app"
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
	os.Setenv("SERVER_NO_MIGRATE", "true")
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

	// read backup.json file
	data, err := local.ReadBackupFile()
	if err != nil {
		return err
	}

	// migrations
	wg := sync.WaitGroup{}
	for i := range data.Collections.Chains {
		fid := i
		d := data.Collections.Chains[fid]
		wg.Add(1)
		go func() {
			defer wg.Done()
			local.MigrateChain(*d, fid)
		}()
	}
	wg.Wait()

	wg = sync.WaitGroup{}
	for i := range data.Collections.Users {
		fid := i
		d := data.Collections.Users[fid]
		wg.Add(1)
		go func() {
			defer wg.Done()
			local.MigrateUser(*d, fid, data.Collections.Chains)
		}()
	}
	wg.Wait()

	wg = sync.WaitGroup{}
	for i := range data.Collections.Mail {
		fid := i
		d := data.Collections.Mail[fid]
		wg.Add(1)
		go func() {
			defer wg.Done()
			local.MigrateMail(*d, fid)
		}()
	}
	wg.Wait()

	wg = sync.WaitGroup{}
	for i := range data.Collections.Payments {
		fid := i
		d := data.Collections.Payments[fid]
		wg.Add(1)
		go func() {
			defer wg.Done()
			local.MigratePayment(*d, fid)
		}()
	}
	wg.Wait()

	wg = sync.WaitGroup{}
	for i := range data.Collections.InterestedUsers {
		fid := i
		d := data.Collections.InterestedUsers[fid]
		wg.Add(1)
		go func() {
			defer wg.Done()
			local.MigrateInterestedUsers(*d, fid)
		}()
	}
	wg.Wait()

	return nil
}
