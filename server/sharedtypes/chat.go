package sharedtypes

import "time"

type ChatPatchUserRequest struct {
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
}
type ChatGetTypeRequest struct {
	ChainUID string `form:"chain_uid" binding:"required,uuid"`
}

type ChatGetTypeResponse struct {
	ChatType string `gorm:"chat_type" json:"chat_type" binding:"required,oneof=off clothingloop signal whatsapp whatsapp discord telegram"`
	ChatUrl  string `gorm:"chat_url" json:"chat_url"`
}
type ChatPatchTypeRequest struct {
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
	ChatType string `json:"chat_type" binding:"required,oneof=off clothingloop signal whatsapp whatsapp discord telegram"`
	ChatUrl  string `json:"chat_url"`
}

type ChatPatchUserResponse struct {
	ChatTeam     string `json:"chat_team"`
	ChatUserID   string `json:"chat_user_id"`
	ChatPass     string `json:"chat_pass"`
	ChatUserName string `json:"chat_user_name"`
}

type ChatCreateChannelRequest struct {
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
	Name     string `json:"name" binding:"required"`
	Color    string `json:"color" binding:"required,hexcolor"`
}

type ChatCreateChannelResponse struct {
	ChatChannel string `json:"chat_channel"`
}

type ChatDeleteChannelRequest struct {
	ChainUID  string `json:"chain_uid" binding:"required,uuid"`
	ChannelID string `json:"channel_id" binding:"required"`
}

type ChatJoinChannelsRequest struct {
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
}

type ChatRoomListQuery struct {
	ChainUID string `form:"chain_uid" binding:"required,uuid"`
}

type ChatRoomListResponse struct {
	List []ChatRoom `json:"list"`
}
type ChatRoomEditRequest struct {
	ChainUID string  `json:"chain_uid" binding:"required,uuid"`
	ID       uint    `json:"id" binding:"required"`
	Name     *string `json:"name" binding:"min=3"`
	Color    *string `json:"color"`
}

type ChatRoomMessageListQuery struct {
	ChainUID   string    `form:"chain_uid" binding:"required,uuid"`
	ChatRoomID uint      `form:"chat_room_id" binding:"required"`
	StartFrom  time.Time `form:"start_from"`
	// starts at 0
	Page int64 `form:"page" binding:"gte=0"`
}

type ChatRoom struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name" binding:"required,min=3"`
	Color     string    `json:"color" binding:"hexcolor"`
	CreatedAt time.Time `json:"created_at"`
	ChainID   uint      `json:"-"`
	ChainUID  string    `json:"chain_uid" gorm:"-:migration;<-:false"`

	ChatMessages []ChatMessage `json:"-"`
}

type ChatMessageCreateRequest struct {
	ChainUID   string `json:"chain_uid" binding:"required,uuid"`
	ChatRoomID uint   `json:"chat_room_id" binding:"required"`
	Message    string `json:"message"`
}

type ChatMessage struct {
	ID         uint      `json:"id"`
	Message    string    `json:"message"`
	SendBy     string    `json:"sent_by"`
	ChatRoomID uint      `json:"chat_room_id"`
	CreatedAt  time.Time `json:"created_at"`
}
