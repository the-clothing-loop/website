package local

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"github.com/samber/lo"
	uuid "github.com/satori/go.uuid"
)

type BackupCollection map[string]*BackupCollectionItem
type BackupCollectionItem map[string]any
type Backup struct {
	Collections struct {
		Chains          BackupCollection `json:"chains"`
		Mail            BackupCollection `json:"mail"`
		Payments        BackupCollection `json:"payments"`
		Users           BackupCollection `json:"users"`
		InterestedUsers BackupCollection `json:"interested_users"`
	} `json:"__collections__"`
}

func ReadBackupFile() (data *Backup, err error) {
	data = &Backup{}
	s, err := os.ReadFile("backup.json")
	if err != nil {
		return nil, fmt.Errorf("could not read file \"backup\"\nError: %e", err)
	}

	err = json.Unmarshal(s, data)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func MigrateChain(d map[string]any, fid string) (chain models.Chain, chainAdminFID string) {
	name := d["name"].(string)
	description := d["description"].(string)
	address := d["address"].(string)
	latitude := d["latitude"].(float64)
	longitude := d["longitude"].(float64)
	radius := d["radius"].(float64)
	published, ok := d["published"].(bool)
	if !ok {
		published = true
	}
	openToNewMembers, ok := d["openToNewMembers"].(bool)
	if !ok {
		openToNewMembers = true
	}
	genders := []string{}
	sizes := []string{}
	if dCat, ok := d["categories"].(map[string]any); ok {
		if dG, ok := (dCat["gender"]).([]any); ok {
			genders = convertGenders(dG)
		}
		if dS, ok := (dCat["size"]).([]any); ok {
			sizes = convertSizes(dS)
		}
	}
	chainAdminFID = d["chainAdmin"].(string)
	chain = models.Chain{
		UID:              uuid.NewV4().String(),
		FID:              sql.NullString{String: fid, Valid: fid != ""},
		Name:             name,
		Description:      description,
		Address:          address,
		Latitude:         latitude,
		Longitude:        longitude,
		Radius:           float32(radius),
		Published:        published,
		OpenToNewMembers: openToNewMembers,
		Sizes:            sizes,
		Genders:          genders,
	}

	return chain, chainAdminFID
}

func MigrateUser(d BackupCollectionItem, fid string, dChains BackupCollection) (user models.User, chainFID string, isChainAdmin bool) {
	chainFID, ok := d["chainId"].(string)
	if !ok {
		chainFID = ""
	}
	address := d["address"].(string)
	sizes := []string{}
	if dS, ok := (d["interestedSizes"]).([]any); ok {
		sizes = convertSizes(dS)
	}

	isRootAdmin := false
	isChainAdmin = false
	if role, ok := d["role"].(string); ok {
		switch role {
		case "admin":
			isRootAdmin = true
		case "chainAdmin":
			isChainAdmin = true
		}
	}

	phoneNumber, ok := d["phoneNumber"].(string)
	if !ok {
		phoneNumber = ""
	}

	user = models.User{
		UID:             uuid.NewV4().String(),
		FID:             sql.NullString{String: fid, Valid: fid != ""},
		Email:           fid + "@example.com",
		IsEmailVerified: false,
		IsRootAdmin:     isRootAdmin,
		Name:            "",
		PhoneNumber:     phoneNumber,
		Address:         address,
		Sizes:           sizes,
		Enabled:         false,
	}

	return user, chainFID, isChainAdmin
}

func MigrateMail(d BackupCollectionItem, fid string) (mail models.Mail) {
	to := d["to"].(string)
	html := ""
	subject := ""
	if msg, ok := d["message"].(map[string]any); ok {
		html = msg["html"].(string)
		subject = msg["subject"].(string)
	}
	mail = models.Mail{
		FID:       sql.NullString{String: fid, Valid: fid != ""},
		To:        to,
		Subject:   subject,
		Body:      html,
		Error:     "",
		CreatedAt: time.Time{},
	}

	return mail
}

func MigratePayment(d BackupCollectionItem, fid string) (payment models.Payment) {
	recurring, ok := d["recurring"].(bool)
	if !ok {
		recurring = false
	}
	email, ok := d["email"].(string)
	if !ok {
		email = ""
	}
	amount, ok := d["email"].(int)
	if !ok {
		amount = 0
	}
	sessionID, ok := d["sessionId"].(string)
	if !ok {
		sessionID = ""
	}
	createdAt, _ := convertDate(d, "createdAt")
	updatedAt, ok := convertDate(d, "updatedAt")
	if !ok {
		updatedAt = createdAt
	}

	payment = models.Payment{
		FID:                   sql.NullString{String: fid, Valid: true},
		Amount:                float32(amount),
		Email:                 email,
		IsRecurring:           recurring,
		SessionStripeID:       sql.NullString{String: sessionID, Valid: sessionID != ""},
		CustomerStripeID:      "",
		PaymentIntentStripeID: "",
		Status:                "",
		CreatedAt:             createdAt,
		UpdatedAt:             updatedAt,
	}

	return payment
}

func MigrateInterestedUsers(d BackupCollectionItem, fid string) (newsletter models.Newsletter) {
	email := d["email"].(string)
	name := d["name"].(string)

	newsletter = models.Newsletter{
		Email:    email,
		Name:     name,
		Verified: false,
	}

	return newsletter
}

func convertDate(d BackupCollectionItem, key string) (time.Time, bool) {
	seconds := int64(0)
	if createdAt, ok := d[key].(map[string]any); ok {
		if createdAt["__datatype__"] == "timestamp" {
			if value, ok := d["value"].(map[string]any); ok {
				seconds = value["_seconds"].(int64)
			}
		}
	}

	if seconds == 0 {
		return time.Time{}, false
	}

	t := time.Unix(seconds, 0)

	return t, true
}

func convertSizes(d []any) []string {
	return lo.FilterMap(d, func(item any, i int) (string, bool) {
		s := fmt.Sprint(item)

		switch s {
		case "baby":
			return models.SizeEnumBaby, true
		case "1To4YearsOld":
			return models.SizeEnum1_4YearsOld, true
		case "5To12YearsOld":
			return models.SizeEnum5_12YearsOld, true
		case "womenSmall":
			return models.SizeEnumWomenSmall, true
		case "womenMedium":
			return models.SizeEnumWomenMedium, true
		case "womenLarge":
			return models.SizeEnumWomenLarge, true
		case "womenPlusSize":
			return models.SizeEnumWomenPlusSize, true
		case "menSmall":
			return models.SizeEnumMenSmall, true
		case "menMedium":
			return models.SizeEnumMenMedium, true
		case "menLarge":
			return models.SizeEnumMenLarge, true
		case "menPlusSize":
			return models.SizeEnumMenPlusSize, true
		default:
			return "", false
		}
	})
}
func convertGenders(d []any) []string {
	return lo.FilterMap(d, func(item any, i int) (string, bool) {
		s := fmt.Sprint(item)

		switch s {
		case "children":
			return models.GenderEnumChildren, true
		case "women":
			return models.GenderEnumWomen, true
		case "men":
			return models.GenderEnumMen, true
		default:
			return "", false
		}
	})
}
