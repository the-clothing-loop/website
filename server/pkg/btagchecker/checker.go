package BTagChecker

import (
	"encoding/xml"
	"io"
	"log"
	"strings"

	"golang.org/x/net/html"
)

func HasValidClosingTags(content string) bool {
	depth := 0
	madeItToEOF := false

	tokenizer := html.NewTokenizer(strings.NewReader(content))
	for {
		tt := tokenizer.Next()
		token := tokenizer.Token()

		// handle errors
		if tt == html.ErrorToken {
			err := tokenizer.Err()
			if err == io.EOF {
				madeItToEOF = true
				break
			}

			log.Fatalf("Error tokenizing: %s", tokenizer.Err())
		}

		shouldAutoClose := false
		for _, tag := range xml.HTMLAutoClose {
			if token.Data == tag {
				shouldAutoClose = true
				break
			}
		}

		if !shouldAutoClose {
			if tt == html.StartTagToken {
				depth += 1
			}
			if tt == html.EndTagToken {
				if depth <= 0 {
					break
				}

				depth -= 1
			}
		}
	}

	if depth == 0 && madeItToEOF {
		return true
	}

	return false
}
