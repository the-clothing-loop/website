import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { cloudOfflineOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";

export default function Offline() {
  const { t } = useTranslation();
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
            <IonIcon icon={cloudOfflineOutline} />
            <p>Offline</p>

            <IonButton onClick={handleClickRefresh}>Refresh</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
