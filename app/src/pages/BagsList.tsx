import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useEffect, useRef } from "react";
import CreateBag from "../components/CreateBag";
import { StoreContext } from "../Store";

export default function BagsList() {
  const { chain, chainUsers, bags, setChain, authUser } =
    useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);

  function refreshBags() {
    setChain(chain, authUser!.uid);
  }

  function handleClickCreate() {
    modal.current?.present();
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Bags</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleClickCreate}>Create</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Bags</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {bags.map((bag) => {
            const user = chainUsers.find((u) => u.uid === bag.user_uid);
            if (!user) return null;
            return (
              <IonItem
                lines="full"
                routerLink={"/address/" + user.uid}
                key={user.uid}
              >
                {user.name}
              </IonItem>
            );
          })}
        </IonList>
        <CreateBag modal={modal} didDismiss={refreshBags} />
      </IonContent>
    </IonPage>
  );
}
