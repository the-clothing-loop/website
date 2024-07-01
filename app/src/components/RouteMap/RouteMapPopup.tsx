import type { Chain, UID } from "../../api/types";
import { useRef, useState } from "react";
import RouteMap from "./RouteMap";
import { useTranslation } from "react-i18next";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

export default function RouteMapPopup(props: {
  chain: Chain;
  authUserUID: UID;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLIonModalElement>(null);
  const [showMap, setShowMap] = useState(false);

  function onClose() {
    setShowMap(false);
    ref.current?.dismiss();
  }
  function onDidPresent() {
    setShowMap(true);
  }
  function onDidDismiss() {
    setShowMap(false);
  }

  return (
    <IonModal
      ref={ref}
      trigger="fab-open-map"
      onDidDismiss={onDidDismiss}
      onDidPresent={onDidPresent}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("route")}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => onClose()}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {showMap ? (
          <RouteMap chain={props.chain} authUserUID={props.authUserUID} />
        ) : null}
      </IonContent>
    </IonModal>
  );
}
