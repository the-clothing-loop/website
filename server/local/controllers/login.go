package controllers

import (
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/server/local/app"
	"github.com/CollActionteam/clothing-loop/server/local/models"
	boom "github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
)

func LoginEmailStep1(c *gin.Context) {
	db := getDB(c)

	var body struct {
		Email string `binding:"required,email" json:"email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, "email required in json")
		return
	}

	// make sure that this email exists in db
	var user = models.User{Email: body.Email}
	if res := db.First(&user); res.Error != nil {
		boom.Unathorized(c.Writer, "email is not yet registered")
		return
	}

	token := app.AuthSignTemporaryEmail(db, &user)

	subject := "Verify e-mail for clothing chain"
	messageHtml := fmt.Sprintf(`Hi %s,<br><br>Click <a href="%s?apiKey=%s">here</a> to verify your e-mail and activate your clothing-loop account.<br><br>Regards,<br>The clothing-loop team!`, user.Name, app.Config.SITE_BASE_URL, token)

	// email user with token
	app.MailSend(c, db, user.Email, subject, messageHtml)
}

func LoginEmailStep2(c *gin.Context) {
	db := getDB(c)

	var query struct {
		Key string `query:"apiKey,required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		boom.BadRequest(c.Writer, "apiKey required")
		return
	}

	user := app.AuthValidateEmail(db, query.Key)
	if user == nil {
		boom.Unathorized(c.Writer)
		return
	}

	if ok := app.AuthSignCookie(c, db, user); !ok {
		boom.Internal(c.Writer)
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, app.Config.SITE_BASE_URL)
}

func LoginBackdoor(c *gin.Context) {

}

func Register(c *gin.Context) {

}

func Logout(c *gin.Context) {
	db := getDB(c)

	if err := app.AuthRevokeCookie(c, db); err != nil {
		boom.BadRequest(c.Writer, err)
	}
}
