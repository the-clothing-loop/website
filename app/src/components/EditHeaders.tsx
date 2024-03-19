import {
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
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";

import type { IonModalCustomEvent } from "@ionic/core";
import { RefObject, useContext, useState } from "react";
import { StoreContext } from "../stores/Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useTranslation } from "react-i18next";
import { chainUpdate } from "../api/chain";
import { refreshOutline } from "ionicons/icons";

export default function EditHeaders(props: {
  initialHeader: string | null;
  headerKey: string;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const { chain, chainHeaders } = useContext(StoreContext);

  const [presentAlert] = useIonAlert();

  const [text, setText] = useState(props.initialHeader);

  function modalInit() {
    setText(props.initialHeader);
    setError("");
  }

  function cancel() {
    props.modal.current?.dismiss();
  }

  function handleSave() {
    if (!chain?.uid) return;
    const _headerKey = props.headerKey;
    const newH = {
      ...chainHeaders,
      [_headerKey]: text,
    };

    chainUpdate({
      uid: chain.uid,
      headers_override: JSON.stringify(newH),
    });

    props.modal.current?.dismiss("", "confirm");
  }

  function reset() {
    if (!chain?.uid) return;
    const handler = () => {
      chainUpdate({
        uid: chain.uid,
        headers_override: "",
      });
      props.modal.current?.dismiss();
    };

    presentAlert({
      header: t("resetHeaders"),
      subHeader: t("areYouSureYouWantToResetHeaders"),
      buttons: [
        {
          text: t("cancel"),
        },
        {
          role: "destructive",
          text: t("reset"),
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
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 0.75, 1]}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>{t("cancel")}</IonButton>
          </IonButtons>
          <IonTitle>{t("update")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSave}
              color={!error ? "primary" : "danger"}
              disabled={text?.length == 0}
            >
              {t("save")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {chain?.headers_override ? (
            <IonItem
              lines="full"
              color="dark"
              key="reset"
              className="tw-bottom-0"
            >
              <IonIcon icon={refreshOutline} className="tw-ml-0.5 tw-mr-5" />
              <IonLabel className="ion-text-wrap">
                <h3>{t("restHeaders")}</h3>
                <p>{t("resetHeadersDesc")}</p>
              </IonLabel>
              <IonButton slot="end" onClick={reset} color="danger">
                {t("reset")}
              </IonButton>
            </IonItem>
          ) : null}
          <IonItem
            lines="none"
            color={error === "number" ? "danger" : undefined}
          >
            {t("updateHeaderDesc")}
          </IonItem>
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
              value={text || ""}
              onIonInput={(e) => setText(e.detail.value + "")}
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
