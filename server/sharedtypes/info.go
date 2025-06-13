package sharedtypes

type InfoTopLoop struct {
	UID          string `json:"uid" gorm:"uid"`
	Name         string `json:"name" gorm:"name"`
	Description  string `json:"description" gorm:"description"`
	MembersCount int    `json:"members_count" gorm:"members_count"`
}

type Info struct {
	TotalChains    int `json:"total_chains" gorm:"total_chains"`
	TotalUsers     int `json:"total_users" gorm:"total_users"`
	TotalCountries int `json:"total_countries" gorm:"total_countries"`
}
