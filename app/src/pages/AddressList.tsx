import {
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext } from "react";
import { StoreContext } from "../Store";

export default function AddressList() {
  const { chainUsers, route } = useContext(StoreContext);

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
          {route.map((userUID, i) => {
            const user = chainUsers.find((u) => u.uid === userUID);
            if (!user) return null;
            return (
              <IonItem
                lines="full"
                routerLink={"/address/" + user.uid}
                key={user.uid}
              >
                {user.name}
                <IonText slot="start" color="medium" className="ion-text-bold">
                  {i + 1}
                </IonText>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
