package services

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"regexp"
	"strings"

	"github.com/GGP1/atoll"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/samber/lo"
	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/models"
	"gopkg.in/guregu/null.v3"
	"gorm.io/gorm"
)

// Checks if the user is registered on the matrix server if not they are registered
func ChatPatchUser(db *gorm.DB, ctx context.Context, mmTeamId string, user *models.User, renewToken bool) (string, error) {
	var mmUser *model.User
	var err error
	// check if user exists properly
	if user.ChatUserID.Valid {
		// get the chat user
		mmUser, _, err = app.ChatClient.GetUser(ctx, user.ChatUserID.String, "")
		if err == nil {
			slog.Info("chat user exists", "id", mmUser.Id)
		}
	}

	if mmUser == nil {
		slog.Info("create Chat user if does not exist")

		username := user.UID
		p, _ := atoll.NewPassword(16, []atoll.Level{atoll.Digit, atoll.Lower, atoll.Upper})
		password := string(p)
		mmUser, _, err = app.ChatClient.CreateUser(ctx, &model.User{
			Nickname: user.Name,
			Username: username,
			Password: password,
			Email:    user.Email.String,
		})
		if err != nil {
			return "", err
		}

		_, _, err = app.ChatClient.AddTeamMember(ctx, mmTeamId, mmUser.Id)
		if err != nil {
			return "", err
		}

		// Update database
		user.ChatUserID = null.StringFrom(mmUser.Id)
		user.ChatPass = null.StringFrom(password)
		db.Exec(`UPDATE users SET chat_user_id = ?, chat_pass = ? WHERE id = ?`,
			user.ChatUserID.String,
			user.ChatPass.String,
			user.ID)
	}

	token := ""

	if renewToken {
		cliUser := model.NewAPIv4Client(app.ChatClient.URL)
		_, _, err := cliUser.LoginById(ctx, user.ChatUserID.String, user.ChatPass.String)
		if err != nil {
			slog.Info("user", "mmUser", mmUser)
			return "", err
		}
		token = cliUser.AuthToken
	}

	return token, nil
}

func ChatJoinRoom(db *gorm.DB, ctx context.Context, chain *models.Chain, user *models.User, isChainAdmin bool) (ChatRoomID string, err error) {
	if user.ChatUserID.String == "" {
		return "", fmt.Errorf("You must be registered on our chat server before joining a room")
	}

	if !chain.ChatRoomID.Valid {
		// If chat room is not valid
		if !isChainAdmin {
			return "", errors.New("The loop host needs to enable this chat first.")
		}

		// Create a new chat room
		mmChannel, _, err := app.ChatClient.CreateChannel(ctx, &model.Channel{
			TeamId:      app.ChatTeamId,
			Name:        chain.UID,
			DisplayName: chain.Name,
			Type:        model.ChannelTypePrivate,
		})
		if err != nil {
			return "", fmt.Errorf("Unable to create a channel %v", err)
		}
		chain.ChatRoomID.String = mmChannel.Id
		db.Exec(`UPDATE chains SET chat_room_id = ? WHERE id = ?`, mmChannel.Id, chain.ID)

		// Add user to new chat room
		_, _, err = app.ChatClient.AddChannelMember(ctx, mmChannel.Id, user.ChatUserID.String)
		if err != nil {
			return "", fmt.Errorf("Unable to add user %v to chat room %v\nerr: %v", user.ChatUserID, mmChannel.Id, err)
		}
	} else {
		// Check if room contains user
		mmChannelMembers, _, err := app.ChatClient.GetChannelMembersByIds(ctx, chain.ChatRoomID.String, []string{user.ChatUserID.String})
		if err != nil {
			return "", fmt.Errorf("Unable to get channel members %v", err)
		}

		// Add user if not already added to chat room
		_, found := lo.Find(mmChannelMembers, func(mmMember model.ChannelMember) bool {
			return mmMember.UserId == user.ChatUserID.String
		})
		if !found {
			_, _, err := app.ChatClient.AddChannelMember(ctx, chain.ChatRoomID.String, user.ChatUserID.String)
			if err != nil {
				return "", fmt.Errorf("Unable to add channel member %v", err)
			}
		}
	}

	return chain.ChatRoomID.String, nil
}

var reChatValidateUniqueName = regexp.MustCompile("[^a-z0-9]")

func ChatValidateUniqueName(name string) string {
	return reChatValidateUniqueName.ReplaceAllString(strings.ToLower(name), "")
}
