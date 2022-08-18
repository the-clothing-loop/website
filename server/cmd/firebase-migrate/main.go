package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/andybalholm/cascadia"
	"github.com/go-playground/validator/v10"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

func main() {
	// retrieve firestore database

	// retrieve firebase authentication
	authRecords, err := auth()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// create sql file

	// create json file
	jsonData := struct {
		FirebaseAuthentication []*AuthRecord `json:"firebase_authentication"`
	}{
		FirebaseAuthentication: authRecords,
	}

	b, err := json.MarshalIndent(&jsonData, "", "\t")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	os.WriteFile("received_data.json", b, 0660)
}

// Firebase Authentication
// --------------------------------------------------------

type AuthRecord struct {
	Email       string     `json:"email"`
	PhoneNumber string     `json:"phone_number"`
	Created     *time.Time `json:"created"`
	LastLogin   *time.Time `json:"last_login"`
	UserFireID  string     `json:"user_fire_id"`
}

func auth() (records []*AuthRecord, err error) {
	s, err := os.ReadFile("tbody.min.htm")
	if err != nil {
		return nil, fmt.Errorf("Could not read file \"tbody.min.htm\"\nError: %e", err)
	}

	hFragments, err := html.ParseFragment(strings.NewReader(string(s)), &html.Node{
		Type:     html.ElementNode,
		Data:     "tbody",
		DataAtom: atom.Tbody,
	})
	if err != nil {
		return nil, fmt.Errorf("Parsing html failed\nError: %e", err)
	}

	if len(hFragments) == 0 {
		return nil, fmt.Errorf("Zero records to export\nData: %v", hFragments)
	}

	records = []*AuthRecord{}
	wg := new(sync.WaitGroup)
	for i, _ := range hFragments {
		child := hFragments[i]
		// filter comments and text nodes
		// https://pkg.go.dev/golang.org/x/net@v0.0.0-20220812174116-3211cb980234/html?utm_source=gopls#NodeType
		if child.Type != html.ElementNode {
			continue
		}

		wg.Add(1)

		record := &AuthRecord{}
		records = append(records, record)

		go authParseRow(wg, child, record)
	}
	wg.Wait()

	return records, nil
}

// Cascadia utility
func Query(n *html.Node, query string) *html.Node {
	sel, err := cascadia.Parse(query)
	if err != nil {
		return &html.Node{}
	}
	return cascadia.Query(n, sel)
}

// Cascadia utility
func QueryAll(n *html.Node, query string) []*html.Node {
	sel, err := cascadia.Parse(query)
	if err != nil {
		return []*html.Node{}
	}
	return cascadia.QueryAll(n, sel)
}

func authParseRow(wg *sync.WaitGroup, n *html.Node, record *AuthRecord) {
	defer wg.Done()

	identifierNodes := QueryAll(n, "td.auth-user-identifier-cell>div>div>div")
	for _, iNode := range identifierNodes {
		if iNode == nil {
			continue
		}
		text := strings.TrimSpace(iNode.FirstChild.Data)
		if err := validator.New().Var(text, "email"); err == nil {
			record.Email = text
		} else {
			record.PhoneNumber = text
		}
	}

	createdAtNode := Query(n, "td.mat-column-created-at>div")
	if createdAtNode != nil {
		t, err := time.Parse("Jan 2, 2006", strings.TrimSpace(createdAtNode.FirstChild.Data))
		if err == nil {
			// fix time differential from EU/Amsterdam + DST time to UTC as of import date 2022-08-18
			t = t.Add(time.Hour - 2)
			record.Created = &t
		}
	}
	lastLoginNode := Query(n, "td.mat-column-last-login>div")
	if lastLoginNode != nil {
		t, err := time.Parse("Jan 2, 2006", strings.TrimSpace(lastLoginNode.FirstChild.Data))
		if err == nil {
			// fix time differential from EU/Amsterdam + DST time to UTC as of import date 2022-08-18
			t = t.Add(time.Hour - 2)
			record.LastLogin = &t
		}
	}
	uidNode := Query(n, "td.mat-column-uid>div")
	if uidNode != nil {
		record.UserFireID = strings.TrimSpace(uidNode.FirstChild.Data)
	}
}

// Firestore Database
// --------------------------------------------------------

type Firestore struct {
	Chains          map[string]*FirestoreChain          `json:"chains`
	Mail            map[string]*FirestoreMail           `json:"mail"`
	Payments        map[string]*FirestorePayments       `json:"payments"`
	Users           map[string]*FirestoreUser           `json:"users"`
	InterestedUsers map[string]*FirestoreInterestedUser `json:"interested_users"`
}

type FirestoreChain struct {
	Categories struct {
		Gender []string `json:"gender"`
		Size   []string `json:"size"`
	} `json:"categories"`
	Name             string  `json:"name"`
	Description      string  `json:"description"`
	Radius           float64 `json:"radius"`
	ChainAdminFireID string  `json:"chainAdmin"`
	Address          string  `json:"address"`
	Longitude        float64 `json:"longitude"`
	Latitude         float64 `json:"latitude"`
	Published        bool    `json:"published"`
}

type FirestoreMail struct {
	Message struct {
		Html    string `json:"html"`
		Subject string `json:"subject"`
	} `json:"message"`
	To string `json:"to"`
}

type FirestorePayments struct {
	CreatedAt  string   `json:"createdAt"`
	Recurring  bool     `json:"recurring"`
	SessionId  string   `json:"sessionId"`
	Completed  bool     `json:"completed"`
	Amount     *float64 `json:"amount"`
	CustomerId string   `json:"customerId"`
	Email      string   `json:"email"`
	UpdatedAt  string   `json:"updatedAt"`
}

type FirestoreUser struct {
	Address         string   `json:"address"`
	ChainFireID     string   `json:"chainId"`
	InterestedSizes []string `json:"interestedSizes"`
}

type FirestoreInterestedUser struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}
