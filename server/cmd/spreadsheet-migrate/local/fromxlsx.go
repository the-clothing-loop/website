package local

import (
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/samber/lo"
	"github.com/tealeg/xlsx"
)

const IndexChainAdmin = 0

var validate = validator.New()

func ReadMigrationFile() (*xlsx.File, error) {
	return xlsx.OpenFile("migration.xlsx")
}

type DataUser struct {
	Name         string
	Address      string
	PhoneNumber  string
	Email        string
	IsChainAdmin bool
}

type DataChain struct {
	UID     string
	Name    string
	Address string
	Users   []DataUser
}

func MigrateChainAndChainAdminUser(sheet *xlsx.Sheet) (chain *DataChain, ok bool) {
	organizerRow := sheet.Rows[0]

	if ok := strings.Contains(organizerRow.Cells[0].Value, "Organisator"); !ok {
		Log.Error("Organisator does not exist\tSheet: '%s'\tValue: '%s'\tContents: '%+v'", sheet.Name, organizerRow.Cells[0].Value, errContentsToStringArr(organizerRow.Cells))
		return nil, false
	}

	chain = &DataChain{
		Name:  sheet.Name,
		Users: []DataUser{},
	}

	for i, row := range sheet.Rows {
		if i == 1 {
			chain.UID = row.Cells[0].Value
			continue
		}
		user := migrateUser(row, sheet.Name, i)
		if user == nil {
			continue
		}
		if i == 0 {
			user.IsChainAdmin = true
			chain.Address = user.Address
		}

		chain.Users = append(chain.Users, *user)
	}

	return chain, true
}

func migrateUser(row *xlsx.Row, sheet string, i int) *DataUser {
	user := &DataUser{}
	for ii, cell := range row.Cells {
		text := strings.TrimSpace(cell.String())
		switch ii {
		case 1:
			user.Name = text
		case 2:
			user.Address = text
		case 3:
			user.PhoneNumber = text
		case 4:
			text = strings.ToLower(text)
			user.Email = text
		}
	}

	if user.Email == "" && user.Name == "" {
		return nil
	}

	if strings.HasSuffix(user.Email, ".cxm") {
		user.Email = ""
	}

	if user.Email != "" {
		if err := validate.Var(user.Email, "email"); err != nil {
			Log.Error("User contains a bad email\tSheet: '%s'\tRow: '%d'\tContents: '%+v'", sheet, i+1, errContentsToStringArr(row.Cells))
		}
	}

	return user
}

func errContentsToStringArr(c []*xlsx.Cell) []string {
	return lo.Map(c, func(c *xlsx.Cell, i int) string { return c.Value })
}
