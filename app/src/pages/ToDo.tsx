import { IonContent, IonIcon, IonPage, IonText } from "@ionic/react";
import { telescopeOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";

export default function ToDo() {
  const { t } = useTranslation();
  return (
    <IonPage>
      <IonContent fullscreen>
        <div
          style={{
            display: "flex",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IonIcon
            size="large"
            color="tertiary"
            className="ion-margin-top"
            icon={telescopeOutline}
          />
          <IonText className="ion-text-center">
            <h3 className="ion-text-bold">{t("stayTuned")}</h3>
            <p>{t("wereWorkingOnIt")}</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
}
