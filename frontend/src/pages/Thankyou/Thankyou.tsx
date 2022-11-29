import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

//Project resources
import { TwoColumnLayout } from "../../components/Layouts";

export interface IProps {
  heading: string;
  subheading: string;
  confirmationEmail: string;
}

function Content({ heading, subheading, confirmationEmail }: IProps) {
  let history = useHistory();
  const { t } = useTranslation();

  return (
    <div className="self-center">
      <h1 className="font-serif font-bold text-5xl text-secondary mb-6">
        {heading}
      </h1>
      <div className="prose mb-6">
        <p className="text-lg">{subheading}</p>
        <p>{confirmationEmail}</p>
        <p>{t("happySwapping")}</p>
      </div>
      <div className="flex flex-row justify-start">
        <button
          className="btn btn-secondary btn-outline mr-4"
          onClick={() => history.push("/")}
        >
          {t("home")}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => history.push("/about")}
        >
          {t("About")}
        </button>
      </div>
    </div>
  );
}

export function NewLoopConfirmation(props: any) {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | New Loop Confirmation</title>
        <meta name="description" content="New Loop Confirmation" />
      </Helmet>
      <main>
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
      </main>
    </>
  );
}

export function JoinLoopConfirmation(props: any) {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Thank you for joining</title>
        <meta name="description" content="Thank you for joining" />
      </Helmet>
      <main>
        <TwoColumnLayout
          img="/images/party-image.jpg"
          children={
            <Content
              heading={t("thankYouForSigningUp")}
              subheading={t(
                "yourClosetIsAboutToBecomeAWholeLotMoreSustainable"
              )}
              confirmationEmail={t("confirmationEmailIsOnItsWay")}
            />
          }
        ></TwoColumnLayout>
      </main>
    </>
  );
}
