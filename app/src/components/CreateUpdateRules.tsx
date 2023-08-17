import {
  InputChangeEventDetail,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonReorder,
  IonReorderGroup,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ItemReorderEventDetail,
  useIonAlert,
  useIonToast,
} from "@ionic/react";

import type {
  IonModalCustomEvent,
  IonTextareaCustomEvent,
  TextareaInputEventDetail,
} from "@ionic/core";
import type {
  IonReorderGroupCustomEvent,
  IonInputCustomEvent,
} from "@ionic/core/components";
import {
  chevronDownOutline,
  chevronUpOutline,
  refreshOutline,
} from "ionicons/icons";
import { RefObject, useContext, useState } from "react";
import { chainUpdate } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import {
  FaqListItem,
  faqItemTranslationOption,
  faqListKeys,
} from "../pages/HelpItem";

export default function CreateUpdateRules(props: {
  rules: string | null;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { t } = useTranslation();
  const { chain } = useContext(StoreContext);
  const [rules, setRules] = useState<FaqListItem[]>([]);
  const setRule = (i: number, r: FaqListItem) =>
    setRules((rr) => {
      let rrr = [...rr];
      rrr[i] = r;
      return rrr;
    });
  const deleteRule = (i: number) =>
    setRules((rr) => {
      let rrr = [...rr];
      rrr.splice(i, 1);
      return rrr;
    });
  const [error, setError] = useState("");
  // -1 means nothing is open
  // n  means that index is open
  const [open, setOpen] = useState(-1);
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();

  function modalInit() {
    setError("");

    if (!props.rules) {
      const data: FaqListItem[] = faqListKeys.map(
        (k) => t(k, faqItemTranslationOption) as any,
      );
      setRules(data);
    } else {
      const data = JSON.parse(props.rules);
      setRules(data);
    }
  }

  function reset() {
    if (!chain?.uid) return;
    const handler = () => {
      chainUpdate({
        uid: chain.uid,
        rules_override: "",
      });
      props.modal.current?.dismiss();
    };

    presentAlert({
      header: t("resetRules"),
      subHeader: t("areYouSureYouWantToResetRules"),
      buttons: [
        {
          text: t("cancel"),
        },
        {
          role: "destructive",
          text: t("delete"),
          handler,
        },
      ],
    });
  }

  function cancel() {
    props.modal.current?.dismiss();
  }
  async function createOrUpdate() {
    if (!chain?.uid) return;

    try {
      await chainUpdate({
        uid: chain.uid,
        rules_override: JSON.stringify(rules),
      });

      setError("");

      props.modal.current?.dismiss("", "confirm");
    } catch (err: any) {
      setError(err.status);
      toastError(present, err);
    }
  }

  function handleReorder(
    e: IonReorderGroupCustomEvent<ItemReorderEventDetail>,
  ) {
    setOpen(-1);
    (async () => {
      setRules(e.detail.complete(rules));
    })();
  }

  function handleClickCreateRule() {
    const newRuleIndex = rules.length;
    setRule(newRuleIndex, {
      title: "",
      content: "",
    });
    setOpen(newRuleIndex);
  }

  function handleClickDeleteRule(index: number) {
    const handler = () => {
      deleteRule(index);
      setOpen(-1);
    };
    let message = rules[index].content.split("\n", 1)[0] || "";
    if (message.length > 10) {
      message = message.slice(0, 20) + "...";
    }
    presentAlert({
      header: t("removeRule"),
      subHeader: rules[index].title,
      message,
      buttons: [
        {
          text: t("cancel"),
        },
        {
          role: "destructive",
          text: t("delete"),
          handler,
        },
      ],
    });
  }

  return (
    <IonModal
      ref={props.modal}
      onIonModalWillPresent={modalInit}
      onIonModalDidDismiss={props.didDismiss}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>{t("cancel")}</IonButton>
          </IonButtons>
          <IonTitle>{t("customLoopRules")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={createOrUpdate}
              color={!error ? "primary" : "danger"}
            >
              {props.rules ? t("update") : t("create")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {chain?.rules_override ? (
            <IonItem lines="full" color="dark" key="reset">
              <IonIcon icon={refreshOutline} className="tw-ml-0.5 tw-mr-5" />
              <IonLabel className="ion-text-wrap">
                <h3>{t("resetRules")}</h3>
                <p>{t("resetDescription")}</p>
              </IonLabel>
              <IonButton slot="end" onClick={reset} color="danger">
                {t("reset")}
              </IonButton>
            </IonItem>
          ) : null}
          <IonReorderGroup
            disabled={open !== -1}
            onIonItemReorder={handleReorder}
          >
            {rules.map((rule, i) => (
              <RuleItem
                key={i}
                rule={rule}
                setRule={(r) => setRule(i, r)}
                open={open === i}
                setOpen={() => setOpen((v) => (v === i ? -1 : i))}
                onClickDeleteRule={() => handleClickDeleteRule(i)}
              />
            ))}
          </IonReorderGroup>
          <IonItem lines="none">
            <IonLabel className="ion-text-center">
              <IonButton onClick={handleClickCreateRule}>
                {t("createNewRule")}
              </IonButton>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}

function RuleItem(props: {
  rule: FaqListItem;
  setRule: (r: FaqListItem) => void;
  open: boolean;
  setOpen: (a: (b: boolean) => boolean) => void;
  onClickDeleteRule: () => void;
}) {
  const toggleOpen = () => props.setOpen((v) => !v);
  const { t } = useTranslation();

  function setRuleItem(
    e:
      | IonInputCustomEvent<InputChangeEventDetail>
      | IonTextareaCustomEvent<TextareaInputEventDetail>,
    key: keyof FaqListItem,
  ) {
    props.setRule({
      ...props.rule,
      [key]: e.target.value || "",
    });
  }

  return (
    <div>
      <IonItem lines="full">
        <IonButtons slot="start">
          <IonButton
            onClick={toggleOpen}
            color="medium"
            className="ion-margin-left"
          >
            <IonIcon
              icon={props.open ? chevronUpOutline : chevronDownOutline}
            />
          </IonButton>
        </IonButtons>
        <IonLabel onClick={toggleOpen}>{props.rule.title}</IonLabel>

        <div slot="end">
          {props.open ? (
            <IonButton color="danger" onClick={props.onClickDeleteRule}>
              {t("delete")}
            </IonButton>
          ) : (
            <IonReorder slot="end" />
          )}
        </div>
      </IonItem>
      <div className={props.open ? "" : "ion-hide"}>
        <IonItem lines="inset" color="light">
          <IonInput
            label={t("title")}
            labelPlacement="stacked"
            type="text"
            value={props.rule.title}
            onIonInput={(e) => setRuleItem(e, "title")}
          />
        </IonItem>
        <IonItem lines="full" color="light">
          <IonTextarea
            label={t("shortExplanation")}
            labelPlacement="stacked"
            autocapitalize="sentences"
            autoGrow
            value={props.rule.content}
            onIonInput={(e) => setRuleItem(e, "content")}
          />
        </IonItem>
      </div>
    </div>
  );
}
