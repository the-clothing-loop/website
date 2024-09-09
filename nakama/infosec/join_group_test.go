package infosec

import (
	"context"
	"testing"

	"github.com/ascii8/nakama-go"
	"github.com/stretchr/testify/assert"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

func TestJoinGroupUnauthorized(t *testing.T) {
	groupName := Faker.Beer().Name()
	var group *nakama.Group

	// Create a new group with an authenticated user
	{
		c := CreateClient()
		ctx := context.Background()

		email := Faker.Internet().Email()
		password := Faker.Internet().Password()
		username := Faker.Internet().User()
		err := c.AuthenticateEmail(ctx, email, password, true, username)
		assert.Nil(t, err)
		group, err = c.CreateGroup(ctx, &nakama.CreateGroupRequest{
			Name:        groupName,
			Description: "",
			LangTag:     "",
			AvatarUrl:   "",
			Open:        true,
			MaxCount:    0,
		})
		assert.Nil(t, err)
	}

	// Attempt to join with an unauthorized user and fail
	{
		c := CreateClient()
		ctx := context.Background()

		err := c.JoinGroup(ctx, group.Id)
		assert.Error(t, err)
	}
}

func TestJoinOpenGroupWithoutAcceptance(t *testing.T) {
	groupName := Faker.Beer().Name()
	var group *nakama.Group

	f := func() (*nakama.Client, context.Context) {
		t.Helper()
		c := CreateClient()
		ctx := context.Background()

		email := Faker.Internet().Email()
		password := Faker.Asciify("***************")
		username := Faker.Internet().User()
		err := c.AuthenticateEmail(ctx, email, password, true, username)
		assert.Nil(t, err)
		return c, ctx
	}

	// Create a new group with an authenticated user
	{
		c, ctx := f()
		var err error
		group, err = c.CreateGroup(ctx, &nakama.CreateGroupRequest{
			Name:        groupName,
			Description: "",
			LangTag:     "",
			AvatarUrl:   "",
			Open:        true,
			MaxCount:    0,
		})
		assert.Nil(t, err)
	}

	// Attempt to join with a user and retrieve messages to an open group and succeed
	{
		c, ctx := f()
		err := c.JoinGroup(ctx, group.Id)
		assert.Nil(t, err)
		res, err := c.GroupUsers(ctx, &nakama.GroupUsersRequest{
			GroupId: group.Id,
			Limit:   wrapperspb.Int32(100),
			// State:   wrapperspb.Int32(int32(nakama.UserRoleState_ADMIN)),
			Cursor: "",
		})
		assert.Nil(t, err)
		account, _ := c.Account(ctx)
		found := false
		for _, v := range res.GroupUsers {
			if v.User.Id == account.User.Id {
				assert.Equal(t, int32(nakama.UserRoleState_MEMBER), v.State.Value)
				found = true
			}
		}
		assert.True(t, found, "Could not find user in group")
	}
}
