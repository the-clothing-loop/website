import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonPage,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { useMemo } from "react";
import { RouteComponentProps } from "react-router";
import data from "../data/faq.json";

export default function HelpItem({
  match,
}: RouteComponentProps<{ index: string }>) {
  const item = useMemo(() => {
    let index = parseInt(match.params.index, 10);

    return data[index];
  }, [match.params.index]);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton>Back</IonBackButton>
          </IonButtons>
          <IonTitle>{item.Title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonHeader collapse="condense">
        <IonToolbar>
          <IonTitle size="large">{item.Title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <h2>{item["Short explanation"]}</h2>
          <p>{item["Paragraph 1"]}</p>
          <p>{item["Paragraph 2"]}</p>
          <p>{item["Paragraph 3"]}</p>
        </IonText>
      </IonContent>
    </IonPage>
  );
}
