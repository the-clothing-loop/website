import { useHistory } from "react-router-dom";
import styles from "./Thankyou.module.css";

// Material
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Button, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

//Project resources
import theme from "../../util/theme";
import { TwoColumnLayout } from "../../components/Layouts";
import Img from "../../images/party-image.jpg";

const Content = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  let history = useHistory();

  return (
    <Grid container className={styles.pageWrapper}>
      <Typography className={styles.h3} component="h3">
        {t("thankYouForSigningUp")}
      </Typography>
      <Typography component="p">
        {t("yourClosetIsAboutToBecomeAWholeLotMoreSustainable")}
      </Typography>
      <Typography component="p">{t("happySwapping")}</Typography>
      <Grid container xs={12} className={styles.buttonsWrapper}>
        <Grid item xs={6}>
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
        </Grid>
        <Grid item xs={6}>
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
        </Grid>
      </Grid>
    </Grid>
  );
};

const Thankyou = (props: any) => {
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Thank you</title>
        <meta name="description" content="Thank you" />
      </Helmet>

      <TwoColumnLayout img={Img} children={<Content />}></TwoColumnLayout>
    </>
  );
};

export default Thankyou;
