// Material
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

//Project resources
import theme from "../util/theme";
import { Button } from "@material-ui/core";

const MessageSubmitted = (props: any) => {
  const { t } = useTranslation();
  let history = useHistory();
  const classes = makeStyles(theme as any)();

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Message Submitted</title>
        <meta name="description" content="Thank you" />
      </Helmet>

      <div className={classes.pageGrid}>
        <div>
          <h3>{t("thankYouForYourMessage")}</h3>
          <p>{t("weWillReplySoon")}</p>
          <div className={classes.formSubmitActions}>
            <Button
              className={classes.buttonOutlined}
              variant="contained"
              color="primary"
              onClick={() => history.push("/")}
              key={"btn-submit-1"}
            >
              {t("home")}
            </Button>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={() => history.push("/")}
              key={"btn-submit-1"}
            >
              {t("FAQ's")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageSubmitted;
