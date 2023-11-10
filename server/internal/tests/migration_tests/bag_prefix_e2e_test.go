//go:build !ci

package migration_tests

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

func TestBagPrefixMigration(t *testing.T) {
	type Options struct {
		OriginalBagName string
		I18nHost1       string
		I18nHost2       string
		ExpectedBagName string
	}

	migrationSql := `
UPDATE bags AS b
	JOIN (
		 SELECT b.id AS bag_id, u.id AS user_id, u.i18n,
		 ROW_NUMBER() OVER (PARTITION BY b.id ORDER BY FIELD(LOWER(u.i18n), 'en', 'fr', 'nl') DESC) AS row_num
		 FROM bags b
			  JOIN user_chains bag_chain ON b.user_chain_id = bag_chain.id
			  JOIN user_chains uc ON bag_chain.chain_id = uc.chain_id AND uc.is_chain_admin = 1
			  LEFT JOIN users u ON uc.user_id = u.id
	) AS ru ON b.id = ru.bag_id
SET b.number = CASE
	WHEN LENGTH(b.number) < 7 AND (
		 LEFT(b.number, 4) != 'Tas ' AND
		 LEFT(b.number, 4) != 'Sac ' AND
		 LEFT(b.number, 4) != 'Bag ')
	THEN
		 CASE
			  WHEN LOWER(ru.i18n) = 'en' THEN CONCAT('Bag ', b.number)
			  WHEN LOWER(ru.i18n) = 'fr' THEN CONCAT('Sac ', b.number)
			  ELSE CONCAT('Tas ', b.number)
		 END
	ELSE b.number
END
WHERE b.id = ?
	`

	tests := []Options{
		{
			OriginalBagName: "one",
			I18nHost1:       "",
			I18nHost2:       "fr",
			ExpectedBagName: "Sac one",
		},
		{
			OriginalBagName: "lorem ipsum",
			I18nHost1:       "",
			I18nHost2:       "fr",
			ExpectedBagName: "lorem ipsum",
		},
		{
			OriginalBagName: "one",
			I18nHost1:       "en",
			I18nHost2:       "fr",
			ExpectedBagName: "Sac one",
		},
		{
			OriginalBagName: "one",
			I18nHost1:       "fr",
			I18nHost2:       "",
			ExpectedBagName: "Sac one",
		},
		{
			OriginalBagName: "one",
			I18nHost1:       "fr",
			I18nHost2:       "en",
			ExpectedBagName: "Sac one",
		},
		{
			OriginalBagName: "one",
			I18nHost1:       "",
			I18nHost2:       "",
			ExpectedBagName: "Tas one",
		}, {
			OriginalBagName: "one",
			I18nHost1:       "",
			I18nHost2:       "",
			ExpectedBagName: "Tas one",
		},
	}

	for i, test := range tests {
		t.Run(fmt.Sprintf("Test %d Name %s", i+1, test.OriginalBagName), func(t *testing.T) {
			chain, host1, _ := mocks.MockChainAndUser(t, db, mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
			})
			host2, _ := mocks.MockUser(t, db, chain.ID, mocks.MockChainAndUserOptions{
				IsChainAdmin: true,
			})
			bag := mocks.MockBag(t, db, chain.ID, host1.ID, mocks.MockBagOptions{
				BagNameOverride: test.OriginalBagName,
			})

			db.Exec(`UPDATE users SET i18n = ? WHERE id = ?`, test.I18nHost1, host1.ID)
			db.Exec(`UPDATE users SET i18n = ? WHERE id = ?`, test.I18nHost2, host2.ID)

			// run
			err := db.Exec(migrationSql, bag.ID).Error
			if err != nil {
				fmt.Printf("Error: %v", err)
			}

			// test
			bagResult := &models.Bag{}
			db.Raw("SELECT * FROM bags WHERE id = ?", bag.ID).Scan(bagResult)
			assert.Equal(t, test.ExpectedBagName, bagResult.Number)
		})
	}
}
