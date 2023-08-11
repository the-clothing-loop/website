package services

import (
	"errors"

	"github.com/the-clothing-loop/website/server/internal/models"
	"gopkg.in/guregu/null.v3/zero"
	"gorm.io/gorm"
)

type UserContactData struct {
	Name  string
	Email zero.String
}

// UsersService defines the methods for user-related operations.
type UsersService interface {
	GetByUID(userUID string, checkEmailVerification bool) (exist bool, user *models.User, err error)
	GetByEmail(userEmail string) (exist bool, user *models.User, err error)
	GetAdminsByChain(chainId uint) ([]UserContactData, error)
}

type usersService struct {
	db *gorm.DB
}

func NewUsersService(db *gorm.DB) UsersService {
	return &usersService{
		db: db,
	}
}

func (u *usersService) GetByUID(userUID string, checkEmailVerification bool) (exist bool, user *models.User, err error) {

	if userUID == "" {
		return false, user, errors.New("userUID is mandatory")
	}

	query := `SELECT users.* FROM users	WHERE users.uid = ?`
	if checkEmailVerification {
		query += ` AND is_email_verified = TRUE`
	}
	query += ` LIMIT 1`

	return executeQuery(u.db, query, userUID)
}

func (u *usersService) GetByEmail(userEmail string) (exist bool, user *models.User, err error) {
	if userEmail == "" {
		return false, user, errors.New("email is mandatory")
	}
	query := `SELECT users.* FROM users	WHERE users.email = ? LIMIT 1`
	return executeQuery(u.db, query, userEmail)
}

func executeQuery(db *gorm.DB, query string, values ...string) (exist bool, user *models.User, err error) {
	user = &models.User{}
	err = db.Raw(query, values).First(&user).Error
	return user.ID != 0, user, err
}

func (u *usersService) GetAdminsByChain(chainId uint) ([]UserContactData, error) {
	results := []UserContactData{}

	err := u.db.Raw(`
	SELECT users.name AS name, users.email AS email
	FROM user_chains AS uc
	LEFT JOIN users ON uc.user_id = users.id 
	WHERE uc.chain_id = ?
		AND uc.is_chain_admin = TRUE
		AND users.is_email_verified = TRUE
	`, chainId).Scan(&results).Error

	if err != nil {
		return nil, err
	}

	return results, nil
}
