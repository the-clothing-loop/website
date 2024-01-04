# BTagChecker

> Fork of: https://github.com/exts/BTagChecker

BTagChecker allows you to check if the tags used within the provided string has any unclosed tags. Great if someone modified some html and broke the header tag without your knowledge

This is modified to ignore the following tags: `basefont`, `br`, `area`, `link`, `img`, `param`, `hr`, `input`, `col`, `frame`, `isindex`, `base`, `meta`. Defined here: [`xml.HTMLAutoClose`](https://cs.opensource.google/go/go/+/refs/tags/go1.21.5:src/encoding/xml/xml.go;l=1869).

# Example

```go
import "<repo>/pkg/BTagChecker"

func main() {
	if BTagChecker.HasValidClosingTags("<b>aye") {
		println("up")
	} else {
		println("oh no someone broke the html in your code")
	}
}
```
