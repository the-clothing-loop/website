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
import { calendarClear } from "ionicons/icons";
import { useContext, useRef, useState } from "react";
import { bulkyItemRemove, BulkyItem } from "../api";
import CreateUpdateBulky from "../components/CreateUpdateBulky";
import { StoreContext } from "../Store";

export default function BulkyList() {
  const { chain, chainUsers, bulkyItems, setChain, authUser } =
    useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();
  const [updateBulky, setUpdateBulky] = useState<BulkyItem | null>(null);

  function refresh() {
    setChain(chain, authUser!.uid);
  }

  function handleClickDelete(id: number) {
    const handler = async () => {
      await bulkyItemRemove(chain!.uid, authUser!.uid, id);
      await setChain(chain, authUser!.uid);
    };
    presentAlert({
      header: "Delete Bulky Item",
      message: "Are you sure you want to delete this bulky item?",
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

  // function handleClickItem(id: number) {
  //   const handler = async (e: UID) => {
  //     console.log(e);

  //     if (typeof e !== "string" || !e) return;
  //     await bagPut({
  //       chain_uid: chain!.uid,
  //       user_uid: authUser!.uid,
  //       holder_uid: e,
  //       number: bagNo,
  //     });
  //     await setChain(chain, authUser!.uid);
  //   };
  // }

  function handleClickCreate() {
    setUpdateBulky(null);

    modal.current?.present();
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Bulky Items</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleClickCreate}>Create</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Bulky Items</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {bulkyItems.map((bulkyItem) => {
            const user = chainUsers.find((u) => u.uid === bulkyItem.user_uid);
            if (!user) return null;

            let createdAt = new Date(bulkyItem.created_at);

            return (
              <IonItemSliding key={user.uid}>
                <IonItem lines="full">
                  <div
                    slot="start"
                    style={{
                      position: "relative",
                    }}
                  >
                    <IonIcon
                      icon={calendarClear}
                      style={{ transform: "scale(2)" }}
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
                      {createdAt.getDate()}
                    </div>
                  </div>
                  <IonText
                    style={{
                      marginTop: "6px",
                      marginBottom: "6px",
                    }}
                    // onClick={() => handleClickItem(bulky.id)}
                  >
                    <h5 className="ion-no-margin">{user.name}</h5>
                    <small>{user.address}</small>
                  </IonText>
                </IonItem>
                <IonItemOptions slot="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => handleClickDelete(bulkyItem.id)}
                  >
                    Delete
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })}
        </IonList>
        <CreateUpdateBulky
          modal={modal}
          didDismiss={refresh}
          bulky={updateBulky}
        />
      </IonContent>
    </IonPage>
  );
}
