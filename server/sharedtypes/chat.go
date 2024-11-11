package sharedtypes

type ChatPatchUserRequest struct {
	ChainUID string `json:"chain_uid" binding:"required,uuid"`
}

type ChatPatchUserResponse struct {
	ChatTeam string `json:"chat_team"`
	ChatUser string `json:"chat_user"`
	ChatPass string `json:"chat_pass"`
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
