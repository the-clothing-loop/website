package views

import (
	"html/template"
	"io/fs"

	"github.com/golang/glog"
)

func mustParseFS(fs fs.FS, patterns ...string) *template.Template {
	templ, err := template.ParseFS(fs, patterns...)
	if err != nil {
		glog.Fatalf("Unable to convert files to template %e", err)
		return nil
	}
	return templ
}
