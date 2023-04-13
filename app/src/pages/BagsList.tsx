import {
  AlertInput,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { bag as bagIcon } from "ionicons/icons";
import { useContext, useEffect, useRef } from "react";
import { bagPut, bagRemove, UID } from "../api";
import CreateBag from "../components/CreateBag";
import { StoreContext } from "../Store";

export default function BagsList() {
  const { chain, chainUsers, bags, setChain, authUser, route } =
    useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();

  function refreshBags() {
    setChain(chain, authUser!.uid);
  }

  function handleClickDelete(bagNo: number) {
    const handler = async () => {
      await bagRemove(chain!.uid, authUser!.uid, bagNo);
      await setChain(chain, authUser!.uid);
    };
    presentAlert({
      header: "Delete Bag",
      message: "Are you sure you want to delete bag number " + bagNo + "?",
      buttons: [
        {
          text: "Cancel",
        },
        {
          text: "Delete",
          handler,
        },
      ],
    });
  }

  function handleClickItem(bagNo: number, currentHolder: UID) {
    const handler = async (e: UID) => {
      console.log(e);

      if (typeof e !== "string" || !e) return;
      await bagPut({
        chain_uid: chain!.uid,
        user_uid: authUser!.uid,
        holder_uid: e,
        number: bagNo,
      });
      await setChain(chain, authUser!.uid);
    };

    let inputs: AlertInput[] = [];
    route.forEach((r) => {
      const user = chainUsers.find((u) => u.uid === r);
      if (!user) return;
      const isChecked = user.uid === currentHolder;
      inputs.push({
        label: user.name,
        type: "radio",
        value: user.uid,
        checked: isChecked,
      });
    });
    presentAlert({
      header: "Change Bag Holder",
      message: "Select the new bag holder",
      inputs,
      buttons: [
        {
          text: "Cancel",
        },
        {
          text: "Change",
          handler,
        },
      ],
    });
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
              <IonItemSliding key={bag.number}>
                <IonItem lines="full">
                  <div slot="start" style={{ position: "relative" }}>
                    <IonIcon
                      icon={bagIcon}
                      style={{
                        transform: "scale(2)",
                        color: bag.color,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        color: "white",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {bag.number}
                    </div>
                  </div>
                  <IonText
                    style={{
                      marginTop: "6px",
                      marginBottom: "6px",
                    }}
                    onClick={() => handleClickItem(bag.number, bag.user_uid)}
                  >
                    <h5 className="ion-no-margin">{user.name}</h5>
                    <small>{user.address}</small>
                  </IonText>
                </IonItem>
                <IonItemOptions slot="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => handleClickDelete(bag.number)}
                  >
                    Delete
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })}
        </IonList>
        <CreateBag modal={modal} didDismiss={refreshBags} />
      </IonContent>
    </IonPage>
  );
}
