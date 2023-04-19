import {
  IonHeader,
  IonToolbar,
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
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-">
        <IonText>
          <h1 style={{ marginTop: 0, fontSize: 30, fontWeight: "bold" }}>
            {item.Title}
          </h1>
          <h2>{item["Short explanation"]}</h2>
          <p>{item["Paragraph 1"]}</p>
          <p>{item["Paragraph 2"]}</p>
          <p>{item["Paragraph 3"]}</p>
        </IonText>
      </IonContent>
    </IonPage>
  );
}
