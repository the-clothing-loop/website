package sharedtypes

import "time"

type ChatPatchUserRequest struct {
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
}
type ChatGetTypeRequest struct {
	ChainUID string `form:"chain_uid" binding:"required,uuid"`
}

type ChatGetTypeResponse struct {
	ChatType          string `gorm:"chat_type" json:"chat_type" binding:"required,oneof=off signal whatsapp whatsapp discord telegram"`
	ChatUrl           string `gorm:"chat_url" json:"chat_url"`
	ChatInAppDisabled bool   `gorm:"chat_in_app_disabled" json:"chat_in_app_disabled"`
}
type ChatPatchTypeRequest struct {
	ChainUID          string `json:"chain_uid" binding:"required,uuid"`
	ChatType          string `json:"chat_type" binding:"required,oneof=off signal whatsapp whatsapp discord telegram"`
	ChatUrl           string `json:"chat_url"`
	ChatInAppDisabled bool   `gorm:"chat_in_app_disabled" json:"chat_in_app_disabled"`
}

type ChatChannelListQuery struct {
	ChainUID string `form:"chain_uid" binding:"required,uuid"`
}

type ChatChannelListResponse struct {
	List []ChatChannel `json:"list"`
}
type ChatChannelEditRequest struct {
	ChainUID string  `json:"chain_uid" binding:"required,uuid"`
	ID       uint    `json:"id" binding:"required"`
	Name     *string `json:"name" binding:"min=3"`
	Color    *string `json:"color"`
}

type ChatChannelDeleteQuery struct {
	ChainUID      string `form:"chain_uid" binding:"required,uuid"`
	ChatChannelID uint   `form:"chat_channel_id" binding:"required"`
}

type ChatChannelMessageListQuery struct {
	ChainUID      string `form:"chain_uid" binding:"required,uuid"`
	ChatChannelID uint   `form:"chat_channel_id" binding:"required"`
	StartFrom     int64  `form:"start_from"`
	// starts at 0
	Page int64 `form:"page"`
}
type ChatChannelMessageListResponse struct {
	Messages []ChatMessage `json:"messages"`
}

type ChatChannel struct {
	ID        uint   `json:"id"`
	Name      string `json:"name" binding:"required,min=3"`
	Color     string `json:"color" binding:"hexcolor"`
	CreatedAt int64  `json:"created_at"`
	ChainID   uint   `json:"-"`
	ChainUID  string `json:"chain_uid" gorm:"-:migration;<-:false"`

	ChatMessages []ChatMessage `json:"-"`
}

type ChatMessageCreateRequest struct {
	ChainUID      string `json:"chain_uid" binding:"required,uuid"`
	ChatChannelID uint   `json:"chat_channel_id" binding:"required"`
	Message       string `json:"message"`
}
type ChatMessageRequest struct {
	ChainUID      string `json:"chain_uid" form:"chain_uid" binding:"required,uuid"`
	ChatChannelID uint   `json:"chat_channel_id" form:"chat_channel_id" binding:"required"`
	ChatMessageID uint   `json:"chat_message_id" form:"chat_message_id" binding:"required"`
}

type ChatMessage struct {
	ID            uint       `json:"id"`
	Message       string     `json:"message"`
	SendByUID     string     `json:"sent_by"`
	ChatChannelID uint       `json:"chat_channel_id"`
	IsPinned      bool       `json:"is_pinned,omitempty"`
	CreatedAt     int64      `json:"created_at"`
	DeletedAt     *time.Time `json:"-"`
}
