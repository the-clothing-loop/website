import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { t } from "i18next";

export default function Offline() {
  const handleClickRefresh = () => window.location.reload();

  return (
    <IonPage>
      <IonHeader collapse="fade" translucent>
        <IonToolbar>
          <IonTitle>{t("information")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color="light">
        <div className="tw-flex tw-items-center tw-h-full tw-justify-center">
          <div className="">
            <span className="feather feather-offline" />
            <p>Offline</p>

            <IonButton onClick={handleClickRefresh}>Refresh</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
