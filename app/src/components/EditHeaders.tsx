import {
  IonButton,
  IonButtons,
  IonContent,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  SelectChangeEventDetail,
  useIonToast,
} from "@ionic/react";

import type {
  IonSelectCustomEvent,
  IonModalCustomEvent,
  IonInputCustomEvent,
} from "@ionic/core";
import { checkmarkCircle, ellipse } from "ionicons/icons";
import { RefObject, useContext, useState } from "react";
import { Bag, bagColors, bagPut, UID } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import { chainUpdate } from "../api";

export default function EditHeaders(props: {
    initalHeader: string | null;
    modal: RefObject<HTMLIonModalElement>;
    didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
  }) {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const { chain } = useContext(StoreContext);

  const [header, setHeader] = useState(props.initalHeader);
  const [present] = useIonToast();

  //const [subheader, setSubheader] = useState("");
  function modalInit() {
    setError("");
  }

  function cancel() {
    props.modal.current?.dismiss();
  }
  async function updateHeader() {

    if (!chain?.uid) return;

    try {
      await chainUpdate({
        uid: chain.uid,
        headers_override: JSON.stringify(header),
      });
      setError("");

      props.modal.current?.dismiss("", "confirm");
    } catch (err: any) {
      setError(err.status);
      toastError(present, err);
    }
  }

  return (
    <IonModal
      ref={props.modal}
      onIonModalWillPresent={modalInit}
      onIonModalDidDismiss={props.didDismiss}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 0.75, 1]}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>{t("cancel")}</IonButton>
          </IonButtons>
          <IonTitle>{t("updateHeaders")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={updateHeader}
              color={!error ? "primary" : "danger"}
            >
              {t("save")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem
            lines="none"
            color={error === "number" ? "danger" : undefined}
          >
            <IonInput
              type="text"
              label={t("Title")}
              labelPlacement="start"
              max={50}
              spellCheck
              autoCapitalize="words"
              maxlength={50}
              counter
              placeholder={props.initalHeader || ""}
              onIonInput={(e) => setHeader(e.detail.value + "")}
            />
          </IonItem>
          <IonItem
            lines="none"
            color={error === "holder" ? "danger" : undefined}
          ></IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
