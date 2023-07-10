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
import {
  calendarClear,
  chatbubbleOutline,
  personCircleOutline,
} from "ionicons/icons";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../toastError";
import { bulkyItemRemove, BulkyItem, User } from "../api";
import CreateUpdateBulky from "../components/CreateUpdateBulky";
import { StoreContext } from "../Store";

export default function BulkyList() {
  const { t } = useTranslation();
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
      header: t("deleteBulkyItem"),
      message: t("areYouSureYouWantToDeleteThisBulkyItem?"),
      buttons: [
        {
          text: t("cancel"),
          role: "cancel",
        },
        {
          text: t("delete"),
          role: "destructive",
          handler,
        },
      ],
    });
  }

  function handleClickCreate() {
    setUpdateBulky(null);

    modal.current?.present();
  }
  function handleClickEdit(b: BulkyItem) {
    setUpdateBulky(b);

    modal.current?.present();
  }
  function handleClickReserve(user: User, bulkyItemName: string) {
    const handler = (type: "sms" | "whatsapp") => {
      let phone = user.phone_number.replaceAll(/[^\d]/g, "");
      let message = window.encodeURI(
        t("imInterestedInThisBulkyItem", { name: bulkyItemName })
      );
      console.log("phone", phone, "message", message);

      switch (type) {
        case "sms":
          window.open(`sms:${phone}?&body=${message}`, "_blank");
          break;
        case "whatsapp":
          window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
      }
    };
    presentAlert({
      header: t("ifYouAreInterestedPleaseSendAMessage", {
        name: user.name,
      }),
      buttons: [
        {
          text: "SMS",
          role: "submit",
          cssClass: "ion-text-bold",
          handler: () => handler("sms"),
        },
        {
          text: "WhatsApp",
          role: "submit",
          cssClass: "ion-text-bold",
          handler: () => handler("whatsapp"),
        },
        {
          text: t("close"),
          role: "cancel",
          cssClass: "ion-text-normal",
        },
      ],
    });
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("bulkyItems")}</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleClickCreate}>{t("create")}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("bulkyItems")}</IonTitle>
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
                    {createdAt.toLocaleDateString()}
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

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <IonButtons className="ion-margin-bottom ion-margin-horizontal">
                    <IonButton
                      fill="clear"
                      onClick={() => handleClickEdit(bulkyItem)}
                    >
                      {t("edit")}
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => handleClickDelete(bulkyItem.id)}
                    >
                      {t("delete")}
                    </IonButton>
                  </IonButtons>
                  <IonButtons className="ion-margin-bottom ion-margin-horizontal">
                    <IonButton
                      slot="end"
                      fill="clear"
                      color="warning"
                      style={{ fontWeight: "bold" }}
                      onClick={() => handleClickReserve(user, bulkyItem.title)}
                    >
                      {t("reserve")}
                      <IonIcon
                        slot="end"
                        icon={chatbubbleOutline}
                        className="ion-icon"
                      />
                    </IonButton>
                  </IonButtons>
                </div>
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
