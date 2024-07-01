package views

import (
	"html/template"
	"io/fs"
	"log/slog"
	"os"
)

func mustParseFS(fs fs.FS, patterns ...string) *template.Template {
	templ, err := template.ParseFS(fs, patterns...)
	if err != nil {
		slog.Error("Unable to convert files to template", "err", err)
		os.Exit(1)
		return nil
	}
	return templ
}
