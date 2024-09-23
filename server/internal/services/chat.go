package services

import (
	"context"
	"fmt"
	"log/slog"
	"regexp"
	"strings"

	"github.com/GGP1/atoll"
	"github.com/samber/lo"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gopkg.in/guregu/null.v3"
	"gorm.io/gorm"
)

// Checks if the user is registered on the matrix server if not they are registered
func ChatPatchUser(db *gorm.DB, ctx context.Context, user *models.User) error {
	if user.ChatPass.Valid {
		return nil
	}

	slog.Info("create Chat user if does not exist")

	p, _ := atoll.NewPassword(16, []atoll.Level{atoll.Digit, atoll.Lower, atoll.Upper})
	password := string(p)
	user.ChatPass = null.StringFrom(password)
	return db.Exec(`UPDATE users SET chat_user_id = ?, chat_pass = ? WHERE id = ?`,
		user.ChatUserID.String,
		user.ChatPass.String,
		user.ID).Error
}

func ChatCreateChannel(db *gorm.DB, chain *models.Chain, mmChannelID string) error {

	// group, err := app.ChatClient.CreateGroup(ctx, &nakama.CreateGroupRequest{
	// 	Name:        name,
	// 	Description: "",
	// 	LangTag:     "",
	// 	AvatarUrl:   "",
	// 	Open:        false,
	// 	MaxCount:    0,
	// })
	// if err != nil {
	// 	return nil, err
	// }

	// err = app.ChatClient.AddGroupUsers(ctx, group.Id, mmUserId)
	// if err != nil {
	// 	return nil, err
	// }

	chain.ChatRoomIDs = append(chain.ChatRoomIDs, mmChannelID)
	return chain.SaveChannelIDs(db)
}

func ChatDeleteChannel(db *gorm.DB, ctx context.Context, chain *models.Chain, mmChannelID string) error {
	// err := app.ChatClient.DeleteGroup(ctx, mmChannelID)
	// if err != nil {
	// 	return err
	// }

	chain.ChatRoomIDs = lo.Filter(chain.ChatRoomIDs, func(roomID string, _ int) bool {
		return roomID != mmChannelID
	})
	return chain.SaveChannelIDs(db)
}

// func chatChannelAddUser(ctx context.Context, mmChannelId string, mmUserId string, setRoleAdmin bool) error {
// 	err := app.ChatClient.AddGroupUsers(ctx, mmChannelId, mmUserId)
// 	if err != nil {
// 		return err
// 	}

// 	return chatChannelSetMemberRole(ctx, mmChannelId, mmUserId, setRoleAdmin)
// }

// func chatChannelSetMemberRole(ctx context.Context, mmChannelId, mmUserId string, setRoleAdmin bool) error {
// 	var err error
// 	if setRoleAdmin {
// 		err = app.ChatClient.PromoteGroupUsers(ctx, mmChannelId, mmUserId)
// 	} else {
// 		err = app.ChatClient.DemoteGroupUsers(ctx, mmChannelId, mmUserId)
// 	}
// 	return err
// }

func ChatJoinChannel(db *gorm.DB, ctx context.Context, chain *models.Chain, user *models.User, isChainAdmin bool, mmChannelId string) error {
	if user.ChatUserID.String == "" {
		return fmt.Errorf("You must be registered on our chat server before joining a room")
	}

	if len(chain.ChatRoomIDs) == 0 || !lo.Contains(chain.ChatRoomIDs, mmChannelId) {
		return fmt.Errorf("Channel does not exist in this Loop")
	}

	// Check if room already contains user
	client2 := app.ChatCreateClient()
	ctx2 := context.Background()
	err := client2.AuthenticateEmail(ctx, user.Email.String, user.ChatPass.String, false, user.Name)
	if err != nil {
		return err
	}
	client2.JoinGroup(ctx2, mmChannelId)
	if isChainAdmin {
		err = app.ChatClient.PromoteGroupUsers(ctx, mmChannelId, user.ChatUserID.String)
		if err != nil {
			return err
		}
	}

	return nil
}

var reChatValidateUniqueName = regexp.MustCompile("[^a-z0-9]")

func ChatValidateUniqueName(name string) string {
	return reChatValidateUniqueName.ReplaceAllString(strings.ToLower(name), "")
}
