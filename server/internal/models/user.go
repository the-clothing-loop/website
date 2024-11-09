package models

import (
	"errors"
	"log/slog"

	// "log/slog"
	"time"

	"github.com/samber/lo"
	"github.com/the-clothing-loop/website/server/pkg/ring_ext"
	"github.com/the-clothing-loop/website/server/sharedtypes"
	"gopkg.in/guregu/null.v3/zero"

	"gorm.io/gorm"
)

var ErrUserNotFound = errors.New("User not found")
var ErrAddUserChainsToObject = errors.New("Unable to add associated loops to user")

type User sharedtypes.User

func (u *User) AddUserChainsToObject(db *gorm.DB) error {
	userChains := []sharedtypes.UserChain{}
	err := db.Raw(`
SELECT
	user_chains.id             AS id,
	user_chains.chain_id       AS chain_id,
	chains.uid                 AS chain_uid,
	user_chains.user_id        AS user_id,
	users.uid                  AS user_uid,
	user_chains.is_chain_admin AS is_chain_admin,
	user_chains.created_at     AS created_at,
	user_chains.is_paused   AS is_paused,
	user_chains.is_approved    AS is_approved
FROM user_chains
LEFT JOIN chains ON user_chains.chain_id = chains.id
LEFT JOIN users ON user_chains.user_id = users.id
WHERE users.id = ?
	`, u.ID).Scan(&userChains).Error
	if err != nil {
		return err
	}

	u.Chains = userChains
	return nil
}

func (u *User) AddNotificationChainUIDs(db *gorm.DB) error {
	userChainIDs := []uint{}
	notificationChainUIDs := []string{}
	if len(u.Chains) == 0 {
		u.NotificationChainUIDs = notificationChainUIDs
		return nil
	}
	for _, uc := range u.Chains {
		if uc.IsChainAdmin {
			userChainIDs = append(userChainIDs, uc.ChainID)
		}
	}
	if len(userChainIDs) == 0 {
		u.NotificationChainUIDs = notificationChainUIDs
		return nil
	}
	err := db.Raw(`
SELECT
	c.uid
	FROM chains AS c
WHERE c.id IN ?
	AND (
		SELECT COUNT(uc.id)
		FROM user_chains AS uc
		JOIN users AS u ON u.id = uc.user_id
		WHERE uc.chain_id = c.id AND uc.is_approved = FALSE AND u.is_email_verified = TRUE
	) > 0
	`, userChainIDs).Pluck("uid", &notificationChainUIDs).Error
	if err != nil {
		return err
	}

	u.NotificationChainUIDs = notificationChainUIDs

	return nil
}

// This required user to have run AddUserChainsToObject before this
func (u *User) IsPartOfChain(chainUID string) (ok, isChainAdmin bool) {
	for _, c := range u.Chains {
		if c.ChainUID == chainUID {
			ok = true
			isChainAdmin = c.IsChainAdmin
			break
		}
	}

	return ok, isChainAdmin
}

// This required user to have run AddUserChainsToObject before this
func (u *User) IsAnyChainAdmin() (isAnyChainAdmin bool) {
	for _, c := range u.Chains {
		if c.IsChainAdmin {
			isAnyChainAdmin = c.IsChainAdmin
			break
		}
	}

	return isAnyChainAdmin
}

func (u *User) CountAttachedBags(db *gorm.DB) (int, error) {
	userChainIDs := []uint{}
	for _, uc := range u.Chains {
		userChainIDs = append(userChainIDs, uc.ID)
	}

	count := 0
	err := db.Raw(`SELECT COUNT(*) FROM bags WHERE user_chain_id IN ?`, userChainIDs).Scan(&count).Error
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (u *User) LastPokeTooRecent() bool {
	if u.LastPokeAt == nil {
		return false
	}

	return !u.LastPokeAt.Before(time.Now().Add(-24 * 7 * time.Hour))
}

func (u *User) SetLastPokeToNow(db *gorm.DB) error {
	return db.Exec(`UPDATE users SET last_poke_at = NOW() WHERE id = ?`, u.ID).Error
}

func (u *User) FindLinkedEventByUID(db *gorm.DB, eventUID string) (e *Event, err error) {
	e = &Event{}
	err = db.Raw(`
SELECT * FROM events
WHERE uid = ? AND user_id = ?
LIMIT 1
	`, eventUID, u.ID).Scan(e).Error
	if err != nil {
		return nil, err
	}

	return e, nil
}

func (u *User) SetAcceptedLegal() {
	u.AcceptedTOHJSON = &u.AcceptedTOH
	u.AcceptedDPAJSON = &u.AcceptedDPA
}

func (u *User) AcceptLegal(db *gorm.DB) error {
	if !u.AcceptedTOH || !u.AcceptedDPA {
		return db.Exec(`UPDATE users SET accepted_toh = TRUE, accepted_dpa = TRUE WHERE id = ?`, u.ID).Error
	}
	return nil
}

type UserContactData struct {
	Name       string      `gorm:"name"`
	Email      zero.String `gorm:"email"`
	I18n       string      `gorm:"i18n"`
	ChainName  string      `gorm:"chain_name"`
	IsApproved bool        `gorm:"is_approved"`
}

// Expects the userUID not to be empty
func UserGetByUID(db *gorm.DB, userUID string, checkEmailVerification bool) (*User, error) {
	query := `SELECT * FROM users	WHERE uid = ?`
	if checkEmailVerification {
		query += ` AND is_email_verified = TRUE`
	}
	query += ` LIMIT 1`

	user := &User{}
	err := db.Raw(query, userUID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return user, nil
}

func UserGetByEmail(db *gorm.DB, userEmail string) (*User, error) {
	if userEmail == "" {
		return nil, errors.New("Email is required")
	}
	query := `SELECT * FROM users	WHERE email = ? LIMIT 1`
	user := &User{}
	err := db.Raw(query, userEmail).First(&user).Error
	if err != nil {
		return nil, err
	}
	return user, nil
}

func UserGetAdminsByChain(db *gorm.DB, chainId ...uint) ([]UserContactData, error) {
	results := []UserContactData{}
	err := db.Raw(`
SELECT
	users.name AS name,
	users.email AS email,
	users.i18n AS i18n,
	chains.name AS chain_name
FROM user_chains AS uc
JOIN users ON uc.user_id = users.id
JOIN chains ON uc.chain_id = chains.id 
WHERE uc.chain_id IN ?
	AND uc.is_chain_admin = TRUE
	AND users.is_email_verified = TRUE
	`, chainId).Scan(&results).Error
	if err != nil {
		return nil, err
	}
	return results, nil
}

func UserGetAllUsersByChain(db *gorm.DB, chainID uint) ([]User, error) {
	results := []User{}

	err := db.Raw(`
SELECT users.*
FROM users
JOIN user_chains ON user_chains.user_id = users.id 
WHERE user_chains.chain_id = ? AND users.is_email_verified = TRUE
	`, chainID).Scan(&results).Error

	if err != nil {
		return nil, err
	}
	return results, nil
}

func UserCheckEmail(db *gorm.DB, userEmail string) (userID uint, found bool, err error) {
	if userEmail == "" {
		return 0, false, errors.New("Email is required")
	}

	var row struct {
		ID uint `gorm:"id"`
	}

	query := `SELECT id FROM users WHERE email = ? LIMIT 1`
	err = db.Raw(query, userEmail).First(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, false, nil
		}
		return 0, false, err
	}
	return row.ID, true, nil
}

func UserOmitData(db *gorm.DB, chain *Chain, users []User, authUserID uint) ([]User, error) {
	routePrivacy := chain.RoutePrivacy

	// Show all users information
	if routePrivacy == -1 {
		// slog.Info("Show all users information")
		return users, nil
	}

	// Hide all users information
	if routePrivacy == 0 {
		// slog.Info("Hide all users information")
		for i, user := range users {
			if user.ID != authUserID {
				_, isChainAdmin := user.IsPartOfChain(chain.UID)
				hideUserInformation(isChainAdmin, &users[i])
			}
		}
		return users, nil
	}

	if len(users) == 0 {
		return users, nil
	}

	// slog.Info("Hide out of bounds information")
	userIDsWithBulkyItems := []uint{}
	db.Raw(`
			SELECT u.id
			FROM users AS u
			JOIN user_chains AS uc on uc.user_id = u.id
			JOIN bulky_items AS bi ON uc.id = bi.user_chain_id
			WHERE uc.chain_id = ? AND bi.id IS NOT NULL
		`, chain.ID).Pluck("id", &userIDsWithBulkyItems)
	userIDsChainAdmin := []uint{}
	userIDsPaused := []uint{}

	routeUIDs, err := chain.GetRouteOrderByUserUID(db)
	if err != nil {
		return nil, err
	}

	lo.ForEach(users, func(u User, i int) {
		_, isChainAdmin := u.IsPartOfChain(chain.UID)
		if isChainAdmin {
			userIDsChainAdmin = append(userIDsChainAdmin, u.ID)
		}

		isCurrentlyPaused := false
		if u.PausedUntil != nil {
			isCurrentlyPaused = u.PausedUntil.After(time.Now())
		}
		if !isCurrentlyPaused {
			uc, ok := lo.Find(u.Chains, func(uc sharedtypes.UserChain) bool { return uc.UserID == u.ID && uc.ChainID == chain.ID })
			if ok && uc.IsPaused {
				isCurrentlyPaused = true
			}
		}
		if isCurrentlyPaused {
			userIDsPaused = append(userIDsPaused, u.ID)
		}
	})

	route := []uint{}
	if len(routeUIDs) != len(users) {
		slog.Info("missmatch length between route uid list and chain users list", "routeUID", routeUIDs, "users", lo.Map(users, func(u User, i int) string { return u.UID }))
	}
	for _, uid := range routeUIDs {
		user, ok := lo.Find(users, func(u User) bool { return u.UID == uid })
		if !ok {
			slog.Warn("missmatch between route uid list and chain users list", "routeUID", uid, "users", lo.Map(users, func(u User, i int) string { return u.UID }))
			continue
		}
		route = append(route, user.ID)
	}

	// Iterates over the noderoute and returns early for each user that matches:
	// 1. the current user
	// 2. users with a bulky item
	// 3. users close by with a max distance defined by the route privacy
	//    paused users are skipped

	routeWithoutPausedUsers := lo.Filter(route, func(item uint, i int) bool {
		return !lo.Contains(userIDsPaused, item)
	})
	userIDsCloseBy := []uint{}
	if len(routeWithoutPausedUsers) > 0 {
		r := ring_ext.NewWithValues(routeWithoutPausedUsers)
		userIDsCloseBy = ring_ext.GetSurroundingValues(r, authUserID, chain.RoutePrivacy)
	}

	slog.Info("User IDs",
		"bulkyItems", userIDsWithBulkyItems,
		"closeBy", userIDsCloseBy,
		"chainAdmin", userIDsChainAdmin,
		"pausedUsers", userIDsPaused,
		"routeIDs", route,
	)

	for i := range users {
		uID := users[i].ID
		if authUserID == uID {
			continue
		}
		if lo.Contains(userIDsWithBulkyItems, uID) {
			continue
		}
		if lo.Contains(userIDsCloseBy, uID) {
			continue
		}
		isChainAdmin := lo.Contains(userIDsChainAdmin, uID)

		hideUserInformation(isChainAdmin, &users[i])
	}

	return users, nil
}

func hideUserInformation(isChainAdmin bool, user *User) {
	if !isChainAdmin {
		user.Email = lo.ToPtr("***")
		user.PhoneNumber = "***"
	}
	user.Address = "***"
}
