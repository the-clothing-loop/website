import {
  IonBackButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonToolbar,
} from "@ionic/react";
import { telescopeOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";

export default function Theme() {
  const { t } = useTranslation();
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/address">{t("back")}</IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ColorPicker />
      </IonContent>
    </IonPage>
  );
}

function ColorPicker() {
  return (
    <IonGrid className="ion-no-padding">
      <IonRow>
        <IonCol
          size="12"
          size-sm="4"
          style={{ backgroundColor: "blue" }}
          onClick={() => console.log("blue clicked")}
        >
          1
        </IonCol>
        <IonCol
          size="12"
          size-sm="4"
          onClick={() => console.log("green clicked")}
        >
          <IonThumbnail style={{ backgroundColor: "green" }}>1</IonThumbnail>
        </IonCol>
        <IonCol size="12" size-sm="4">
          3
        </IonCol>
        <IonCol size="12" size-sm="4">
          3
        </IonCol>
        <IonCol size="12" size-sm="4">
          3
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
