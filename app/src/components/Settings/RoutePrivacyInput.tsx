import {
  IonItem,
  IonButton,
  IonLabel,
  IonIcon,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonLoading,
} from "@ionic/react";
import { t } from "i18next";
import { Chain, User } from "../../api/types";
import { useEffect, useRef, useState } from "react";
import { addOutline, eyeOffOutline, removeOutline } from "ionicons/icons";
import RoutePrivacyExample from "./RoutePrivacyExample";

export default function RoutePrivacyInput(props: {
  chain: Chain;
  authUser: User;
  onChange: (rp: number) => Promise<void>;
}) {
  const [routePrivacy, setRoutePrivacy] = useState(
    props.chain.route_privacy || 2,
  );
  const [presentLoading, dismissLoading] = useIonLoading();
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    setRoutePrivacy(props.chain.route_privacy || 2);
  }, [props.chain]);

  function submit() {
    presentLoading();
    props
      .onChange(routePrivacy)
      .then(() => {
        modal.current?.dismiss(null, "confirm");
      })
      .finally(() => {
        dismissLoading();
      });
  }

  function handleOpenAlert() {
    modal.current?.present();
  }

  function handleInput(type: "+" | "-") {
    setRoutePrivacy((s) => {
      let v = type === "+" ? s + 1 : s - 1;
      if (v < -1) v = -1;
      if (v > 20) v = 20;
      return v;
    });
  }

  return (
    <>
      <IonModal ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss()}>
                {t("cancel")}
              </IonButton>
            </IonButtons>
            <IonTitle>{t("routePrivacy")}</IonTitle>
            <IonButtons slot="end">
              <IonButton color="primary" onClick={() => submit()}>
                {t("save")}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="ion-padding">
            <p>
              {routePrivacy === -1
                ? t("routePrivacyDescriptionAll")
                : t("routePrivacyDescription", { count: routePrivacy })}
            </p>
          </div>
          <IonItem lines="none">
            <IonLabel>{t("routePrivacy")}</IonLabel>
            <div slot="end" className="tw-flex tw-items-center">
              <IonButton color="light" onClick={() => handleInput("-")}>
                <IonIcon slot="icon-only" icon={removeOutline} />
              </IonButton>
              <span className="tw-w-8 tw-text-center">{routePrivacy}</span>
              <IonButton color="light" onClick={() => handleInput("+")}>
                <IonIcon slot="icon-only" icon={addOutline} />
              </IonButton>
            </div>
          </IonItem>
          <div className="tw-flex tw-flex-col">
            <IonItem lines="none">{t("example") + ":"}</IonItem>
            <div className="tw-border tw-border-medium tw-m-6 tw-mt-2">
              <RoutePrivacyExample
                authUserName={props.authUser.name}
                routePrivacy={routePrivacy}
              />
            </div>
          </div>
        </IonContent>
      </IonModal>
      <IonItem lines="none" onClick={handleOpenAlert} button detail={false}>
        <IonLabel>
          <h3>{t("routePrivacy")}</h3>
          <p className="ion-text-wrap">{t("routePrivacyInfo")}</p>
        </IonLabel>
        <IonIcon icon={eyeOffOutline} className="tw-text-purple" />
      </IonItem>
    </>
  );
}
("holiday");
