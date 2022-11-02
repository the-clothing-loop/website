package local

import (
	"fmt"
	"time"

	"github.com/ian-kent/go-log/appenders"
	"github.com/ian-kent/go-log/layout"
	"github.com/ian-kent/go-log/levels"
	"github.com/ian-kent/go-log/log"
	"github.com/ian-kent/go-log/logger"
)

var Log logger.Logger

func init() {
	Log = log.Logger()
	fp := fmt.Sprintf("spreadsheet-migrate.%s.log", time.
		Now().
		Format("2006-01-02_15-04-05"))
	fappender := appenders.RollingFile(fp, true)
	fappender.MaxBackupIndex = 200
	fappender.MaxFileSize = 10000000
	fappender.SetLayout(&emojiLayout{WithTime: true})

	cappender := appenders.Console()
	cappender.SetLayout(&emojiLayout{})

	Log.SetAppender(appenders.Multiple(&emojiLayout{}, fappender, cappender))
	Log.SetLevel(levels.TRACE)
}

type emojiLayout struct {
	layout.Layout
	WithTime bool
}

func (e *emojiLayout) Format(level levels.LogLevel, message string, args ...any) string {
	msg := fmt.Sprintf(message, args...)

	emoji := ""
	switch level {
	case levels.TRACE:
		emoji = "✅"
	case levels.DEBUG:
		emoji = "⚙️"
	case levels.INFO:
		emoji = "ℹ️"
	case levels.WARN:
		emoji = "⚠️"
	case levels.ERROR:
		emoji = "❌"
	}

	msg = fmt.Sprintf("%s  %s", emoji, msg)
	if e.WithTime {
		t := time.Now().Format("2006-01-02 15:04:05")
		msg = fmt.Sprintf("%s %s", t, msg)
	}

	return msg
}
