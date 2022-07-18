package controllers

import (
	"fmt"
	"net/http"

	"github.com/CollActionteam/clothing-loop/local/global"
	"github.com/CollActionteam/clothing-loop/local/models"
	boom "github.com/darahayes/go-boom"
	"github.com/gin-gonic/gin"
)

func LoginEmailStep1(c *gin.Context) {
	var body struct {
		Email string `binding:"required,email" json:"email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		boom.BadRequest(c.Writer, "email required in json")
		return
	}

	// make sure that this email exists in db
	var user = models.User{Email: body.Email}
	if res := global.DB.First(&user); res.Error != nil {
		boom.Unathorized(c.Writer, "email is not yet registered")
		return
	}

	token := global.AuthSignTemporaryEmail(&user)

	subject := "Verify e-mail for clothing chain"
	messageHtml := fmt.Sprintf(`Hi %s,<br><br>Click <a href="%s?apiKey=%s">here</a> to verify your e-mail and activate your clothing-loop account.<br><br>Regards,<br>The clothing-loop team!`, user.Name, global.Config.SiteBaseUrl, token)

	// email user with token
	global.MailSend(c, user.Email, subject, messageHtml)
}

func LoginEmailStep2(c *gin.Context) {
	var query struct {
		Key string `query:"apiKey,required"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		boom.BadRequest(c.Writer, "apiKey required")
		return
	}

	user := global.AuthValidateEmail(query.Key)
	if user == nil {
		boom.Unathorized(c.Writer)
		return
	}

	if ok := global.AuthSignCookie(c, user); !ok {
		boom.Internal(c.Writer)
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, global.Config.SiteBaseUrl)
}

func Logout(c *gin.Context) {
	if err := global.AuthRevokeCookie(c); err != nil {
		boom.BadRequest(c.Writer, err)
	}
}
