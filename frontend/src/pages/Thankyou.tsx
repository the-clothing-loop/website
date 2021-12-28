import React from "react";
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
        <div className={classes.confirmationWrapper}>
          <ProgressBar activeStep={2} />

          <div>
            <h3>{t("thankYouForJoining")}</h3>
            <p>{t("youWillReceiveAnEmail")}</p>

            <Button
              className={classes.submitBtn}
              variant="contained"
              color="primary"
              onClick={() => history.push("/")}
              key={"btn-submit-1"}
            >
              {t("home")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Thankyou;
