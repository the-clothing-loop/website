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
  TextareaChangeEventDetail,
  useIonAlert,
  useIonToast,
} from "@ionic/react";

import type { IonModalCustomEvent } from "@ionic/core";
import type {
  IonReorderGroupCustomEvent,
  IonTextareaCustomEvent,
  IonInputCustomEvent,
} from "@ionic/core/components";
import { chevronDownOutline, chevronUpOutline } from "ionicons/icons";
import { RefObject, useContext, useState } from "react";
import { chainUpdate } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import { FaqListItem } from "../pages/HelpItem";

export default function CreateUpdateRules(props: {
  rules: string | null;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { t, i18n } = useTranslation();
  const { bags, chainUsers, route, chain, authUser } = useContext(StoreContext);
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

    if (props.rules === null) {
      const data = t("list", {
        ns: "faq",
        returnObjects: true,
      }) as FaqListItem[];
      setRules(data);
    } else {
      const data = JSON.parse(props.rules);
      setRules(data);
    }
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
    e: IonReorderGroupCustomEvent<ItemReorderEventDetail>
  ) {
    setOpen(-1);
    (async () => {
      setRules(e.detail.complete(rules));
    })();
  }

  function handleClickCreateRule() {
    const newRuleIndex = rules.length;
    setRule(newRuleIndex, {
      Title: "",
      "Title 2": "",
      "Short explanation": "",
      "Paragraph 1": "",
      "Paragraph 2": "",
      "Paragraph 3": "",
    });
    setOpen(newRuleIndex);
  }

  function handleClickDeleteRule(index: number) {
    const handler = () => {
      deleteRule(index);
      setOpen(-1);
    };
    presentAlert({
      header: t("removeRule"),
      subHeader: rules[index].Title,
      message: rules[index]["Short explanation"],
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
            <IonButton onClick={cancel}>{t("Cancel")}</IonButton>
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
  let paragraphs = [
    props.rule["Paragraph 1"],
    props.rule["Paragraph 2"],
    props.rule["Paragraph 3"],
  ].join("\n");
  const toggleOpen = () => props.setOpen((v) => !v);
  const { t } = useTranslation();

  function setParagraphs(e: IonTextareaCustomEvent<TextareaChangeEventDetail>) {
    let values = (e.target.value || "").split("\n");
    let p1 = values.shift() || "";
    let p2 = values.shift() || "";
    let p3 = values.join("\n") || "";

    props.setRule({
      ...props.rule,
      "Paragraph 1": p1,
      "Paragraph 2": p2,
      "Paragraph 3": p3,
    });
  }

  function setRuleItem(
    e: IonInputCustomEvent<InputChangeEventDetail>,
    key: keyof FaqListItem
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
        <IonLabel onClick={toggleOpen}>{props.rule.Title}</IonLabel>

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
        <IonItem lines="none" color="light">
          <IonInput
            label="Title"
            labelPlacement="stacked"
            type="text"
            value={props.rule.Title}
            onIonChange={(e) => setRuleItem(e, "Title")}
          />
        </IonItem>
        <IonItem lines="none" color="light">
          <IonInput
            label="Short explanation"
            labelPlacement="stacked"
            type="text"
            value={props.rule["Short explanation"]}
            onIonChange={(e) => setRuleItem(e, "Short explanation")}
          />
        </IonItem>
        <IonItem lines="none" color="light">
          <IonTextarea
            label="paragraphs"
            labelPlacement="stacked"
            rows={6}
            style={{ lineHeight: "1.4em" }}
            value={paragraphs}
            onIonChange={(e) => setParagraphs(e)}
          />
        </IonItem>
      </div>
    </div>
  );
}
