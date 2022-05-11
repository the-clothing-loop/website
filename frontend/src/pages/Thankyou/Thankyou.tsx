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

export interface IProps {
  heading: string;
  subheading: string;
}

const Content = ({ heading, subheading }: IProps) => {
  const classes = makeStyles(theme as any)();
  let history = useHistory();
  const { t } = useTranslation();

  return (
    <Grid container className={styles.pageWrapper}>
      <Typography className={styles.h3} component="h3">
        {heading}
      </Typography>
      <Typography component="p">{subheading}</Typography>
      <Typography component="p" className={styles.p}>
        {t("confirmationEmailIsOnItsWay")}
      </Typography>
      <Typography component="p" className={styles.p}>
        {t("happySwapping")}
      </Typography>
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

const NewLoopConfirmation = (props: any) => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | New Loop Confirmation</title>
        <meta name="description" content="New Loop Confirmation" />
      </Helmet>

      <TwoColumnLayout
        img={Img}
        children={
          <Content
            heading={t("thankYouForStartingThisLoop")}
            subheading={t("youAreUnlockingTheClothesSwapPotential")}
          />
        }
      ></TwoColumnLayout>
    </>
  );
};

const JoinLoopConfirmation = (props: any) => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Thank you for joining</title>
        <meta name="description" content="Thank you for joining" />
      </Helmet>

      <TwoColumnLayout
        img={Img}
        children={
          <Content
            heading={t("thankYouForSigningUp")}
            subheading={t("yourClosetIsAboutToBecomeAWholeLotMoreSustainable")}
          />
        }
      ></TwoColumnLayout>
    </>
  );
};

export { NewLoopConfirmation, JoinLoopConfirmation };
