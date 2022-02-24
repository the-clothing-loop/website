import { useHistory } from "react-router-dom";

// Material
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";

//Project resources
import theme from "../util/theme";
import ProgressBar from "../components/ProgressBar";

const Thankyou = (props: any) => {
  let history = useHistory();

  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Thank you</title>
        <meta name="description" content="Thank you" />
      </Helmet>

      <div className={classes.pageGrid}>
        <div>
          <h3>{t("thankYouForSigningUp")}</h3>
          <p>{t("yourClosetIsAboutToBecomeAWholeLotMoreSustainable")}</p>
          <p>{t("happySwapping")}</p>
          <div className={classes.formSubmitActions}>
            <Button
              className={classes.buttonOutlined}
              variant="contained"
              color="primary"
              onClick={() => history.push("/")}
              key={"btn-submit-1"}
              style={{ margin: "2% 0" }}
            >
              {t("home")}
            </Button>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={() => history.push("/about")}
              key={"btn-submit-1"}
              style={{ margin: "2% 0" }}
            >
              {t("About")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Thankyou;
