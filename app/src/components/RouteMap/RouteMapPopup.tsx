import type { Chain, UID } from "../../api/types";
import { RefObject, useContext, useState } from "react";
import RouteMap from "./RouteMap";
import { useTranslation } from "react-i18next";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { StoreContext } from "../../stores/Store";

export default function RouteMapPopup(props: {
  chain: Chain;
  authUserUID: UID;
  isChainAdmin: boolean;
  modal: RefObject<HTMLIonModalElement>;
}) {
  const { t } = useTranslation();
  const [showMap, setShowMap] = useState(false);
  const { toggleChainAllowMap } = useContext(StoreContext);

  function onClose() {
    setShowMap(false);
    props.modal.current?.dismiss();
  }
  function onDidPresent() {
    setShowMap(true);
  }
  function onDidDismiss() {
    setShowMap(false);
  }
  function onToggleAllowMap() {
    toggleChainAllowMap();
  }

  return (
    <IonModal
      ref={props.modal}
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
      {props.isChainAdmin ? (
        <IonItem lines="full" detail={false} button onClick={onToggleAllowMap}>
          <IonLabel className="ion-text-wrap">
            <h3>{t("allowMapTitle")}</h3>
            <p>{t("allowMapBody")}</p>
          </IonLabel>
          <IonToggle
            aria-label={t("allowMapTitle")}
            slot="end"
            checked={props.chain.allow_map || false}
          />
        </IonItem>
      ) : null}
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
            isChainAdmin={props.isChainAdmin}
            key="route_map"
          />
        ) : null}
      </IonContent>
    </IonModal>
  );
}
