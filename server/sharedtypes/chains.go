package sharedtypes

type ChainResponse struct {
	UID              string   `json:"uid" gorm:"chains.uid"`
	Name             string   `json:"name" gorm:"chains.name"`
	Description      string   `json:"description" gorm:"chains.description"`
	Address          string   `json:"address" gorm:"chains.address"`
	Image            *string  `json:"image" gorm:"chains.image"`
	Latitude         float64  `json:"latitude" gorm:"chains.latitude"`
	Longitude        float64  `json:"longitude" gorm:"chains.longitude"`
	Radius           float32  `json:"radius" gorm:"chains.radius"`
	Sizes            []string `json:"sizes" gorm:"chains.sizes;serializer:json"`
	Genders          []string `json:"genders" gorm:"chains.genders;serializer:json"`
	Published        bool     `json:"published" gorm:"chains.published"`
	OpenToNewMembers bool     `json:"open_to_new_members" gorm:"chains.open_to_new_members"`
	TotalMembers     *int     `json:"total_members,omitempty" gorm:"total_members"`
	TotalHosts       *int     `json:"total_hosts,omitempty" gorm:"total_hosts"`
	RulesOverride    *string  `json:"rules_override,omitempty" gorm:"chains.rules_override"`
	HeadersOverride  *string  `json:"headers_override,omitempty" gorm:"chains.headers_override"`
	Theme            *string  `json:"theme,omitempty" gorm:"chains.theme"`
	IsAppDisabled    *bool    `json:"is_app_disabled,omitempty" gorm:"chains.is_app_disabled"`
	RoutePrivacy     *int     `json:"route_privacy,omitempty" gorm:"chains.route_privacy"`
	AllowMap         *bool    `json:"allow_map,omitempty" gorm:"chains.allow_map"`
	ChatRoomIDs      []string `json:"chat_room_ids,omitempty" gorm:"chains.chat_room_ids"`
}

type ChainCreateRequest struct {
	Name             string   `json:"name" binding:"required"`
	Description      string   `json:"description"`
	Address          string   `json:"address" binding:"required"`
	CountryCode      string   `json:"country_code" binding:"required"`
	Latitude         float64  `json:"latitude" binding:"required"`
	Longitude        float64  `json:"longitude" binding:"required"`
	Radius           float32  `json:"radius" binding:"required,gte=1.0,lte=100.0"`
	OpenToNewMembers bool     `json:"open_to_new_members" binding:"required"`
	Sizes            []string `json:"sizes" binding:"required"`
	Genders          []string `json:"genders" binding:"required"`
	AllowTOH         bool     `json:"allow_toh" binding:"required"`
}

type ChainUpdateRequest struct {
	UID              string    `json:"uid" binding:"required"`
	Name             *string   `json:"name,omitempty"`
	Description      *string   `json:"description,omitempty"`
	Address          *string   `json:"address,omitempty"`
	Image            *string   `json:"image,omitempty"`
	CountryCode      *string   `json:"country_code,omitempty"`
	Latitude         *float32  `json:"latitude,omitempty"`
	Longitude        *float32  `json:"longitude,omitempty"`
	Radius           *float32  `json:"radius,omitempty" binding:"omitempty,gte=1.0,lte=100.0"`
	Sizes            *[]string `json:"sizes,omitempty"`
	Genders          *[]string `json:"genders,omitempty"`
	RulesOverride    *string   `json:"rules_override,omitempty"`
	HeadersOverride  *string   `json:"headers_override,omitempty"`
	Published        *bool     `json:"published,omitempty"`
	OpenToNewMembers *bool     `json:"open_to_new_members,omitempty"`
	Theme            *string   `json:"theme,omitempty"`
	RoutePrivacy     *int      `json:"route_privacy"`
	AllowMap         *bool     `json:"allow_map,omitempty"`
	IsAppDisabled    *bool     `json:"is_app_disabled,omitempty"`
}

type ChainAddUserRequest struct {
	UserUID      string `json:"user_uid" binding:"required,uuid"`
	ChainUID     string `json:"chain_uid" binding:"required,uuid"`
	IsChainAdmin bool   `json:"is_chain_admin"`
}

type ChainRemoveUserRequest struct {
	UserUID  string `json:"user_uid" binding:"required,uuid"`
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
}

type ChainChangeUserWardenRequest struct {
	UserUID  string `json:"user_uid" binding:"required,uuid"`
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
	Warden   bool   `json:"warden"`
}

type ChainApproveUserRequest struct {
	UserUID  string `json:"user_uid" binding:"required,uuid"`
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
}
