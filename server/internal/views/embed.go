package views

import (
	"bytes"
	"html/template"
	"io/fs"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/internal/app/goscope"
	"github.com/gin-gonic/gin"
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

func executeTemplate(c *gin.Context, t *template.Template, name string, data any) (string, error) {
	buf := new(bytes.Buffer)
	err := t.ExecuteTemplate(buf, name, data)
	if err != nil {
		goscope.Log.Errorf("Unable to find template: %v", err)
		c.String(http.StatusInternalServerError, "Unable to find template")
		return "", err
	}

	return buf.String(), nil
}
