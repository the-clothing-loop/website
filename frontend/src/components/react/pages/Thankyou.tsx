//Project resources
import { TwoColumnLayout } from "../components/Layouts";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { $authUser } from "../../../stores/auth";
import getQuery from "../util/query";
import useLocalizePath from "../util/localize_path.hooks";
import useHydrated from "../util/hydrated.hooks";

export interface IProps {
  heading: string;
  subheading: string;
}

function Content({ heading, subheading }: IProps) {
  const authUser = useStore($authUser);
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  return (
    <div className="self-center">
      <h1 className="font-serif font-bold text-5xl text-secondary mb-6">
        {heading}
      </h1>
      <div className="prose mb-6">
        <p className="text-lg">{subheading}</p>
        {authUser ? null : <p>{t("confirmationEmailIsOnItsWay")}</p>}
        <p>{t("happySwapping")}</p>
      </div>
      <div className="flex flex-row justify-start">
        <a
          className="btn btn-secondary btn-outline mr-4"
          href={localizePath("/")}
        >
          {t("home")}
        </a>
        <a
          className="btn btn-secondary btn-outline"
          href={localizePath("/faq")}
        >
          {t("FAQ")}
        </a>
      </div>
    </div>
  );
}

export function NewLoopConfirmation() {
  const { t } = useTranslation();
  const name = useHydrated(() => {
    return getQuery("name")[0] || "";
  });

  return (
    <>
      <main>
        <TwoColumnLayout
          t={t}
          img="https://images.clothingloop.org/x600/party_image.jpg"
          alt="A pink bag with the number nine duck-taped to the side, surrounded by balloons, flags, lint and candles"
        >
          <Content
            heading={t("thankYouForStartingThisLoop", { name })}
            subheading={t("youAreUnlockingTheClothesSwapPotential")}
          />
        </TwoColumnLayout>
      </main>
    </>
  );
}

export function JoinLoopConfirmation() {
  const { t } = useTranslation();

  return (
    <>
      <main>
        <TwoColumnLayout
          t={t}
          img="https://images.clothingloop.org/x600/party_image.jpg"
          alt="A pink bag with the number nine duck-taped to the side, surrounded by balloons, flags, lint and candles"
        >
          <Content
            heading={t("thankYouForSigningUp")}
            subheading={t("yourClosetIsAboutToBecomeAWholeLotMoreSustainable")}
          />
        </TwoColumnLayout>
      </main>
    </>
  );
}
