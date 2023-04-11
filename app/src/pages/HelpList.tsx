import {
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import data from "../data/faq.json";

export default function HelpList() {
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>How does it work?</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">How does it work?</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {data.map((item, index) => (
            <IonItem routerLink={"/help/" + index} lines="full" key={index}>
              {item.Title}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
