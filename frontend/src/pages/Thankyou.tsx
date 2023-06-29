import { useHistory, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

//Project resources
import { TwoColumnLayout } from "../components/Layouts";
import { useQueryParam } from "use-query-params";

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
          className="btn btn-secondary btn-outline"
          onClick={() => history.push("/faq")}
        >
          {t("FAQ")}
        </button>
      </div>
    </div>
  );
}

export function NewLoopConfirmation(props: any) {
  const { t } = useTranslation();
  const [name] = useQueryParam("name");

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | New Loop Confirmation</title>
        <meta name="description" content="New Loop Confirmation" />
      </Helmet>
      <main>
        <TwoColumnLayout
          t={t}
          img="https://images.clothingloop.org/x600/party_image.jpg"
          alt="A pink bag with the number nine duck-taped to the side, surrounded by balloons, flags, lint and candles"
        >
          <Content
            heading={t("thankYouForStartingThisLoop", { name })}
            subheading={t("youAreUnlockingTheClothesSwapPotential")}
            confirmationEmail={t("hostConfirmationEmailIsOnItsWay")}
          />
        </TwoColumnLayout>
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
          t={t}
          img="https://images.clothingloop.org/x600/party_image.jpg"
          alt="A pink bag with the number nine duck-taped to the side, surrounded by balloons, flags, lint and candles"
        >
          <Content
            heading={t("thankYouForSigningUp")}
            subheading={t("yourClosetIsAboutToBecomeAWholeLotMoreSustainable")}
            confirmationEmail={t("confirmationEmailIsOnItsWay")}
          />
        </TwoColumnLayout>
      </main>
    </>
  );
}
