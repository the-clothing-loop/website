package app

import (
	"context"
	"fmt"
	"log/slog"

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

	_, _, err = client.PatchConfig(context.TODO(), &model.Config{
		ServiceSettings: model.ServiceSettings{
			EnableUserAccessTokens: lo.ToPtr(true),
			EnableOutgoingWebhooks: lo.ToPtr(true),
		},
		TeamSettings: model.TeamSettings{
			SiteName:              lo.ToPtr("Clothing Loop Chat"),
			CustomDescriptionText: lo.ToPtr("Open the MyClothingLoop app"),
			MaxUsersPerTeam:       lo.ToPtr(99_999),
			MaxChannelsPerTeam:    lo.ToPtr[int64](999_999),
		},
		EmailSettings: model.EmailSettings{
			EnableSignUpWithEmail:    lo.ToPtr(false),
			RequireEmailVerification: lo.ToPtr(false),
			SendEmailNotifications:   lo.ToPtr(true),
			FeedbackName:             lo.ToPtr("The Clothing Loop"),
			FeedbackEmail:            lo.ToPtr("noreply@clothingloop.org"),
			EnableEmailBatching:      lo.ToPtr(true),
			EmailBatchingInterval:    lo.ToPtr(5 * 30 /* seconds */),
			ReplyToAddress:           lo.ToPtr("hello@clothingloop.org"),
			SMTPUsername:             &Config.SMTP_USER,
			SMTPPassword:             &Config.SMTP_PASS,
			SMTPServer:               &Config.SMTP_HOST,
			SMTPPort:                 lo.ToPtr(fmt.Sprint(Config.SMTP_PORT)),
			EnableSMTPAuth:           lo.ToPtr(Config.SMTP_PASS != ""),
			ConnectionSecurity:       lo.ToPtr(lo.Ternary(Config.SMTP_PASS != "", model.ConnSecurityTLS, model.ConnSecurityNone)),
		},
		PluginSettings: model.PluginSettings{
			PluginStates: map[string]*model.PluginState{
				"com+mattermost+nps": {
					Enable: false,
				},
				"com+mattermost+calls": {
					Enable: false,
				},
			},
		},
		SupportSettings: model.SupportSettings{
			SupportEmail: lo.ToPtr("hello@clothingloop.org"),
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

	if err != nil {
		slog.Error("unable to set mattermost configuration")
		panic(err)
	}

	// client.web

	ChatTeamId = mmTeam.Id
}
