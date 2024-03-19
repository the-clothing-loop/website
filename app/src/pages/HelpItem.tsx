import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonText,
  IonPage,
  IonBackButton,
  IonButtons,
  IonIcon,
} from "@ionic/react";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TOptionsBase } from "i18next";
import { RouteComponentProps } from "react-router";
import { StoreContext } from "../stores/Store";

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
  const { chain, isThemeDefault } = useContext(StoreContext);

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
            <IonBackButton
              className={
                isThemeDefault ? "tw-text-red dark:tw-text-red-contrast" : ""
              }
            >
              {t("back")}
            </IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="tw-min-h-full tw-flex tw-flex-col">
          <IonText className="tw-flex-grow">
            <h1
              className={"tw-mt-0 tw-text-3xl tw-font-bold tw-font-serif".concat(
                isThemeDefault ? " tw-text-red dark:tw-text-red-contrast" : "",
              )}
            >
              {item.title}
            </h1>
            {item.content.split("\n").map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </IonText>
          <IonIcon
            aria-hidden="true"
            icon="/the_clothing_loop_logo_cropped.svg"
            style={{ fontSize: 150 }}
            className="tw-relative tw-w-full tw-min-h-auto tw-invert-[40%] tw-bottom-0 -tw-mb-8 tw-overflow-hidden tw-stroke-text dark:tw-stroke-light-tint"
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
