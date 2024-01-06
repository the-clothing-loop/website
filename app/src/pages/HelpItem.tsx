import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonText,
  IonPage,
  IonBackButton,
  IonButtons,
  IonImg,
} from "@ionic/react";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TOptionsBase } from "i18next";
import { RouteComponentProps } from "react-router";
import { StoreContext } from "../Store";

export interface FaqListItem {
  title: string;
  content: string;
}

export const faqListKeys = [
  "howDoesItWork",
  "whereAreTheBags",
  "whoDoIGiveTheBagTo",
  "whatCanYouTakeFromTheBag",
  "whatCantYouTakeFromTheBag",
  "whatToDoWithBulkyItems",
  "awayOrBusy",
  "foundSomethingYouLike",
  "newMembers",
  "privacy",
  "feedback",
];

export const faqItemTranslationOption: TOptionsBase = {
  ns: "faq",
  returnObjects: true,
  defaultValue: {
    title: "🔴 Error",
    content: "Translation not found",
  },
};

export default function HelpItem({
  match,
}: RouteComponentProps<{ index: string }>) {
  const { t } = useTranslation();
  const { chain } = useContext(StoreContext);

  const item = useMemo<FaqListItem>(() => {
    let index = parseInt(match.params.index, 10);

    if (chain && chain.rules_override) {
      const json = JSON.parse(chain.rules_override);
      return json[index] || faqItemTranslationOption.defaultValue;
    }

    return t(faqListKeys[index], faqItemTranslationOption);
  }, [match.params.index, chain]);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton className="tw-text-red">{t("back")}</IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="tw-min-h-full tw-flex tw-flex-col">
          <IonText className="tw-flex-grow">
            <h1 className="tw-mt-0 tw-text-3xl tw-font-bold tw-font-serif tw-text-red">
              {item.title}
            </h1>
            {item.content.split("\n").map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </IonText>

          <IonImg
            src="/the_clothing_loop_logo_cropped.svg"
            className="tw-w-full tw-h-auto tw-invert-[60%] -tw-mb-4 tw-mt-8"
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
