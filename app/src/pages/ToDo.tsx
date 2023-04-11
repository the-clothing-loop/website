import { IonContent, IonIcon, IonPage, IonText } from "@ionic/react";
import { telescopeOutline } from "ionicons/icons";

export default function ToDo() {
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
            className="ion-margin-top"
            icon={telescopeOutline}
          />
          <IonText className="ion-text-center">
            <h3 className="ion-text-bold">Stay tuned</h3>
            <p>We're working on it</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
}
