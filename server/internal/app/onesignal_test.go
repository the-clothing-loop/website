package app

import (
	"fmt"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetInvalidExternalUserIds(t *testing.T) {
	expect := []string{Faker.UUID().V4(), Faker.UUID().V4(), Faker.UUID().V4()}
	in := OneSignalErrorResponse{
		Errors: []string{
			"Option Metadata must not exceed 3500 bytes.",
			"Data Data must be no more than 2048 bytes long",
			"Option Message in English language is too long to send to an iOS device. You can either make the content shorter or shorten or remove the other options.",
		},
		Warnings: map[string]string{
			"invalid_external_user_ids": fmt.Sprintf("The following external_ids have unsubscribed subscriptions attached: [\"%s\", \"%s\", \"%s\"]", expect[0], expect[1], expect[2]),
		},
	}

	assert.Equal(t, expect, in.GetInvalidExternalUserIds())
}

func TestOneSignalCreateNotificationCheckByteSize(t *testing.T) {
	count := 50
	arr := []string{}
	for i := 0; i < count; i++ {
		arr = append(arr, Faker.UUID().V4())
	}
	str := strings.Join(arr, ",")
	assert.Greater(t, len([]byte(str)), 1800)
}
