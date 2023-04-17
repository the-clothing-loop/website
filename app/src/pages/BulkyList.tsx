import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { calendarClear, personCircleOutline } from "ionicons/icons";
import { useContext, useRef, useState } from "react";
import toastError from "../../toastError";
import { bulkyItemRemove, BulkyItem } from "../api";
import CreateUpdateBulky from "../components/CreateUpdateBulky";
import { StoreContext } from "../Store";

export default function BulkyList() {
  const { chain, chainUsers, bulkyItems, setChain, authUser } =
    useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();
  const [present] = useIonToast();
  const [updateBulky, setUpdateBulky] = useState<BulkyItem | null>(null);

  function refresh() {
    setChain(chain, authUser!.uid);
  }

  function handleClickDelete(id: number) {
    const handler = async () => {
      await bulkyItemRemove(chain!.uid, authUser!.uid, id).catch((err) => {
        toastError(present, err);
      });
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
  function handleClickEdit(b: BulkyItem) {
    setUpdateBulky(b);

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
        <div>
          {bulkyItems.map((bulkyItem) => {
            const user = chainUsers.find((u) => u.uid === bulkyItem.user_uid);
            if (!user) return null;

            let createdAt = new Date(bulkyItem.created_at);

            return (
              <IonCard key={bulkyItem.id}>
                {bulkyItem.image_url ? (
                  <img alt={bulkyItem.title} src={bulkyItem.image_url} />
                ) : null}
                <IonCardHeader>
                  <IonCardTitle>{bulkyItem.title}</IonCardTitle>
                  <IonCardSubtitle>
                    {createdAt.toLocaleString()}
                  </IonCardSubtitle>
                  <div
                    slot="end"
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
                </IonCardHeader>

                <IonCardContent>
                  <IonItem
                    lines="none"
                    routerLink={"/address/" + user.uid}
                    style={{
                      marginLeft: "-16px",
                      marginRight: "-16px",
                    }}
                  >
                    <IonIcon
                      slot="start"
                      className="ion-align-self-start"
                      icon={personCircleOutline}
                    />
                    <IonText>
                      <h5 className="ion-no-margin ion-text-bold">
                        {user.name}
                      </h5>
                      <small className="ion-text-wrap">{user.address}</small>
                    </IonText>
                  </IonItem>
                  <IonText
                    style={{
                      color: "var(--ion-color-dark)",
                    }}
                  >
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                      }}
                      className="ion-padding-top"
                    >
                      {bulkyItem.message}
                    </p>
                  </IonText>
                </IonCardContent>

                <IonButtons className="ion-margin-bottom ion-margin-horizontal">
                  <IonButton
                    fill="clear"
                    onClick={() => handleClickEdit(bulkyItem)}
                  >
                    Edit
                  </IonButton>
                  <IonButton
                    fill="clear"
                    color="danger"
                    onClick={() => handleClickDelete(bulkyItem.id)}
                  >
                    Delete
                  </IonButton>
                </IonButtons>
              </IonCard>
            );
          })}
        </div>
        <CreateUpdateBulky
          modal={modal}
          didDismiss={refresh}
          bulky={updateBulky}
        />
      </IonContent>
    </IonPage>
  );
}
