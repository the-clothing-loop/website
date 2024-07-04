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
  isChainAdmin: boolean;
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
        {props.isChainAdmin ? null : (
          <p
            className="tw-absolute tw-top-0 tw-left-0 tw-z-20 tw-mx-4 tw-mt-1 tw-text-sm tw-text-medium"
            key="map_not_accurate"
          >
            {t("mapNotAccurate")}
          </p>
        )}
        {showMap ? (
          <RouteMap
            chain={props.chain}
            authUserUID={props.authUserUID}
            key="route_map"
          />
        ) : null}
      </IonContent>
    </IonModal>
  );
}
