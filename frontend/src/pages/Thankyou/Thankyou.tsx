import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";

//Project resources
import { TwoColumnLayout } from "../../components/Layouts";

export interface IProps {
  heading: string;
  subheading: string;
  confirmationEmail: string;
}

const Content = ({ heading, subheading, confirmationEmail }: IProps) => {
  let history = useHistory();
  const { t } = useTranslation();

  return (
    <Grid container className="">
      <h3 className="tw-text-2xl tw-text-secondary">{heading}</h3>
      <p>{subheading}</p>
      <p>{confirmationEmail}</p>
      <p>{t("happySwapping")}</p>
      <Grid container>
        <Grid item xs={6}>
          <button
            className="tw-btn tw-btn-primary tw-btn-outline"
            onClick={() => history.push("/")}
          >
            {t("home")}
          </button>
        </Grid>
        <Grid item xs={6}>
          <button
            className="tw-btn tw-btn-primary"
            onClick={() => history.push("/about")}
          >
            {t("About")}
          </button>
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
        img="/images/party-image.jpg"
        children={
          <Content
            heading={t("thankYouForStartingThisLoop")}
            subheading={t("youAreUnlockingTheClothesSwapPotential")}
            confirmationEmail={t("hostConfirmationEmailIsOnItsWay")}
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
        img="/images/party-image.jpg"
        children={
          <Content
            heading={t("thankYouForSigningUp")}
            subheading={t("yourClosetIsAboutToBecomeAWholeLotMoreSustainable")}
            confirmationEmail={t("confirmationEmailIsOnItsWay")}
          />
        }
      ></TwoColumnLayout>
    </>
  );
};

export { NewLoopConfirmation, JoinLoopConfirmation };
