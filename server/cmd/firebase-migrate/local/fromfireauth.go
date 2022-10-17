package local

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/CollActionteam/clothing-loop/server/local/models"
	"gorm.io/gorm"
)

type AuthDataUser struct {
	FID              string `json:"localId"`
	Email            string `json:"email"`
	EmailVerified    bool   `json:"emailVerified"`
	DisplayName      string `json:"displayName"`
	LastSignedInAt   string `json:"lastSignedInAt"`
	CreatedAt        string `json:"createdAt"`
	PhoneNumber      string `json:"phoneNumber"`
	Disabled         bool   `json:"disabled"`
	CustomAttributes string `json:"customAttributes"`
	ProviderUserInf  []any  `json:"providerUserInfo"`
}
type AuthDataUserCustomAttr struct {
	Role     string `json:"role"`
	ChainFID string `json:"chainId"`
}
type AuthData struct {
	Users []*AuthDataUser `json:"users"`
}

func ReadAuthDataFile() (data *AuthData, err error) {
	data = &AuthData{}
	s, err := os.ReadFile("auth_data.json")
	if err != nil {
		return nil, fmt.Errorf("could not read file \"backup\"\nError: %e", err)
	}

	err = json.Unmarshal(s, data)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func MigrateAuth(db *gorm.DB, d AuthDataUser) {
	user := &models.User{}
	if err := db.First(user, "fid = ?", d.FID).Error; err != nil {
		log.Printf("user not found in database with an fid of %v", d.FID)
		return
	}

	{
		customAttributes := AuthDataUserCustomAttr{}
		err := json.Unmarshal([]byte(d.CustomAttributes), &customAttributes)
		if err != nil {
			chain := &models.Chain{}
			if err := db.First(chain, "fid = ?", customAttributes.ChainFID).Error; err == nil {
				db.Create(&models.UserChain{
					UserID:       user.ID,
					ChainID:      chain.ID,
					IsChainAdmin: customAttributes.Role == "chainAdmin",
				})
			} else {
				log.Printf("chain not found in database with an fid of %s from user fid %s", customAttributes.ChainFID, user.FID.String)
			}
		}
	}

	if createdAt, err := FromUnixStrToTime(d.CreatedAt); err == nil {
		user.CreatedAt = *createdAt
	} else {
		user.CreatedAt = time.Now()
	}
	if d.LastSignedInAt != "" {
		if lastSignedInAt, err := FromUnixStrToTime(d.LastSignedInAt); err == nil {
			user.LastSignedInAt = sql.NullTime{Time: *lastSignedInAt, Valid: true}
		}
	}
	user.Email = d.Email
	user.IsEmailVerified = d.EmailVerified
	user.Name = d.DisplayName
	user.Enabled = !d.Disabled
	user.PhoneNumber = d.PhoneNumber

	if d.FID == "Cpd9bMjmIYNuQd0iHTeTzp4ZbV32" {
		log.Printf("lastSignedInAt: %+v -> %+v", d.LastSignedInAt, user.LastSignedInAt.Time)
	}

	user.UpdatedAt = time.Now()
	db.Save(user)
}
