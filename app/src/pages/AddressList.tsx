import {
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext } from "react";
import { StoreContext } from "../Store";

export default function AddressList() {
  const { chainUsers } = useContext(StoreContext);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Addresses</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Addresses</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {chainUsers.map((user) => (
            <IonItem routerLink={"/address/" + user.uid} key={user.uid}>
              {user.name}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
