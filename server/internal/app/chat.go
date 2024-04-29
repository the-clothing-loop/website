package app

import (
	"context"
	"fmt"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/samber/lo"
)

var ChatClient *model.Client4
var ChatTeamId string

func ChatInit(url, token string) {
	client := model.NewAPIv4Client(url)
	client.SetToken(token)

	ChatClient = client
}

func ChatSetDefaultSettings(client *model.Client4) {
	team := &model.Team{
		Name:        "loops",
		DisplayName: "Loops",
		Type:        model.TeamInvite,
	}
	if Config.ENV == EnvEnumAcceptance {
		team.Name += "acc"
		team.DisplayName += " Acc"
	} else if Config.ENV == EnvEnumDevelopment {
		team.Name += "dev"
		team.DisplayName += " Dev"
	}

	mmTeam, _, err := client.GetTeamByName(context.TODO(), team.Name, "")
	if err != nil {
		fmt.Println(err.Error())
		mmTeam, _, err = client.CreateTeam(context.TODO(), team)
		if err != nil {
			panic(err)
		}
	}

	client.PatchConfig(context.TODO(), &model.Config{
		ServiceSettings: model.ServiceSettings{
			EnableUserAccessTokens: lo.ToPtr(true),
		},
		TeamSettings: model.TeamSettings{
			SiteName:           lo.ToPtr("Clothing Loop Chat"),
			MaxUsersPerTeam:    lo.ToPtr(99_999),
			MaxChannelsPerTeam: lo.ToPtr[int64](999_999),
		},
		EmailSettings: model.EmailSettings{
			EnableSignUpWithEmail:    lo.ToPtr(false),
			RequireEmailVerification: lo.ToPtr(false),
		},
		PrivacySettings: model.PrivacySettings{
			ShowEmailAddress: lo.ToPtr(false),
			ShowFullName:     lo.ToPtr(false),
		},
		NativeAppSettings: model.NativeAppSettings{
			AppDownloadLink:        lo.ToPtr("https://www.clothingloop.org/en/"),
			IosAppDownloadLink:     lo.ToPtr("https://apps.apple.com/us/app/my-clothing-loop/id6451443500"),
			AndroidAppDownloadLink: lo.ToPtr("https://play.google.com/store/apps/details?id=org.clothingloop.app"),
		},
	})

	ChatTeamId = mmTeam.Id
}
