package models_test

import (
	"strings"
	"testing"

	"github.com/cdfmlr/ellipsis"
	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
)

func TestBagAddUpdatedUser(t *testing.T) {
	f := func(name, initial, expected string) {
		t.Helper()
		b := &models.Bag{}
		b.LastUserEmailToUpdate = initial
		b.AddLastUserEmailToUpdateFifo("new@example.com")
		assert.Equal(t, b.LastUserEmailToUpdate, expected, name)
	}

	f("Add to empty", "", "new@example.com")
	f("Add to len 1", "old@example.com", "old@example.com,new@example.com")
	f("Add to len 2", "old2@example.com,old@example.com", "old2@example.com,old@example.com,new@example.com")
	f("Add to len 3", "old3@example.com,old2@example.com,old@example.com", "old3@example.com,old2@example.com,old@example.com,new@example.com")
	f("Add to len 4", "old4@example.com,old3@example.com,old2@example.com,old@example.com", "old3@example.com,old2@example.com,old@example.com,new@example.com")
	f("Add to len 5", "old5@example.com,old4@example.com,old3@example.com,old2@example.com,old@example.com", "old3@example.com,old2@example.com,old@example.com,new@example.com")

	f("Add duplicate", "new@example.com", "new@example.com")
	f("Add duplicate with old", "old@example.com,new@example.com", "old@example.com,new@example.com")
	f("Add duplicate with other edit", "new@example.com,old@example.com", "new@example.com,old@example.com,new@example.com")
}

func TestTextEllipsis(t *testing.T) {
	f := func(name string, count, max int, expected string) {
		t.Helper()
		ghosts := strings.Repeat("👻", count)

		ghostsCut := ghosts[:max]
		assert.Equal(t, expected, ghostsCut, name)
	}

	f("a third of an emoji", 1, 1, "\xf0" /*"👻"*/)
	f("1 emoji", 1, 4, "👻")
}

func TestTextEllipsis2(t *testing.T) {
	f := func(name string, count, max int, expected string) {
		t.Helper()
		ghosts := strings.Repeat("👻", count)

		ghostsCut := ellipsis.Ending(ghosts, max)
		assert.Equal(t, expected, ghostsCut, name)
	}

	f("1 emoji", 1, 4, "👻")
	f("0 emoji", 0, 4, "")
	f("1 and ellipsis", 2, 4, "👻...")
}

func TestBagStringMaxAppend(t *testing.T) {
	f := func(name, inputList, inputStr, expected string) {
		t.Helper()

		output, _ := models.BagStringMaxAppend(inputList, inputStr)
		assert.Equal(t, expected, output, name)
	}

	f("add to empty", "", "a", "a")
	f("add to one", "a", "b", "a,b")
	f("add to 3", "a,b,c", "d", "a,b,c,d")
	f("add to 4", "a,b,c,d", "e", "b,c,d,e")
	f("last is same as input", "a,b", "b", "a,b")
}
