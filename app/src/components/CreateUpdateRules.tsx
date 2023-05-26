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
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ItemReorderEventDetail,
  SelectChangeEventDetail,
  TextareaChangeEventDetail,
  useIonToast,
} from "@ionic/react";

import type { IonModalCustomEvent } from "@ionic/core";
import type {
  IonReorderGroupCustomEvent,
  IonTextareaCustomEvent,
  IonInputCustomEvent,
} from "@ionic/core/components";
import {
  arrowDown,
  arrowUp,
  chevronDownOutline,
  chevronUpOutline,
} from "ionicons/icons";
import { ChangeEvent, RefObject, useContext, useState } from "react";
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
  const [error, setError] = useState("");
  // -1 means nothing is open
  // n  means that index is open
  const [open, setOpen] = useState(-1);
  const [present] = useIonToast();

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
          <IonTitle>{t("createBag")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={createOrUpdate}
              color={!error ? "primary" : "danger"}
            >
              {t("update")}
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
              />
            ))}
          </IonReorderGroup>
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
}) {
  let paragraphs = [
    props.rule["Paragraph 1"],
    props.rule["Paragraph 2"],
    props.rule["Paragraph 3"],
  ].join("\n");
  const toggleOpen = () => props.setOpen((v) => !v);

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
        <IonReorder slot="end"></IonReorder>
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
