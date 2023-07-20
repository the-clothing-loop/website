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
  IonModal,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { calendarClear, chatbubbleOutline } from "ionicons/icons";
import { Fragment, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../toastError";
import { bulkyItemRemove, BulkyItem, User } from "../api";
import CreateUpdateBulky from "../components/CreateUpdateBulky";
import { StoreContext } from "../Store";
import { isPlatform } from "@ionic/core";

export default function BulkyList() {
  const { t } = useTranslation();
  const { chain, chainUsers, bulkyItems, setChain, authUser, isChainAdmin } =
    useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();
  const [present] = useIonToast();
  const [updateBulky, setUpdateBulky] = useState<BulkyItem | null>(null);
  const [isCapacitor] = useState(isPlatform("capacitor"));
  const [modalDescBody, setModalDescBody] = useState("");
  const refModalDesc = useRef<HTMLIonModalElement>(null);

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

  function handleClickReadMore(text: string) {
    setModalDescBody(text);
    refModalDesc.current?.present();
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
    const handler = (
      type: "sms" | "whatsapp" | "telegram" | "signal" | "share",
    ) => {
      let phone = user.phone_number.replaceAll(/[^\d]/g, "");
      let message = window.encodeURI(
        t("imInterestedInThisBulkyItem", { name: bulkyItemName }),
      );
      console.log("phone", phone, "message", message);

      switch (type) {
        case "sms":
          window.open(`sms:${phone}?&body=${message}`, "_blank");
          break;
        case "whatsapp":
          window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
          break;
        case "telegram":
          window.open(`https://t.me/+${phone}?text=${message}`, "_blank");
          break;
        case "signal":
          window.open(`https://signal.me/+${phone}`, "_blank");
          break;
      }
    };
    let buttons = [
      {
        text: "SMS",
        role: "submit",
        cssClass: "ion-text-bold",
        handler: () => handler("sms"),
      },
      {
        text: "Telegram",
        role: "submit",
        cssClass: "ion-text-bold",
        handler: () => handler("telegram"),
      },
      {
        text: "Signal",
        role: "submit",
        cssClass: "ion-text-bold",
        handler: () => handler("signal"),
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
    ];

    presentAlert({
      header: t("ifYouAreInterestedPleaseSendAMessage", {
        name: user.name,
      }),
      buttons,
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
            const isMe = authUser?.uid === user.uid;
            let createdAt = new Date(bulkyItem.created_at);
            let shouldExpandText = bulkyItem.message.length > 100;

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
                    <IonText>
                      <h5 className="ion-no-margin ion-text-bold">
                        {user.name}
                      </h5>
                      <small className="ion-text-wrap">{user.address}</small>
                    </IonText>
                  </IonItem>
                  <IonItem
                    button={shouldExpandText}
                    detail={false}
                    lines="none"
                    onClick={
                      shouldExpandText
                        ? () => handleClickReadMore(bulkyItem.message)
                        : undefined
                    }
                    style={{
                      marginLeft: -16,
                      marginRight: -16,
                    }}
                  >
                    <IonText
                      style={{
                        color: "var(--ion-color-dark)",
                        paddingTop: 3,
                        paddingBottom: 3,
                      }}
                    >
                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                          overflow: "hidden",
                          display: "block",
                          ...(shouldExpandText
                            ? {
                                maxHeight: 60,
                              }
                            : {}),
                        }}
                      >
                        {bulkyItem.message}
                      </p>
                      {shouldExpandText ? (
                        <small
                          style={{
                            marginTop: -3,
                            display: "block",
                            color: "var(--ion-color-medium)",
                          }}
                        >
                          {t("readMore")}
                        </small>
                      ) : null}
                    </IonText>
                  </IonItem>
                </IonCardContent>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <IonButtons className="ion-margin-bottom ion-margin-horizontal">
                    {isMe || isChainAdmin ? (
                      <>
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
                      </>
                    ) : null}
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

          <IonModal
            ref={refModalDesc}
            initialBreakpoint={0.4}
            breakpoints={[0, 0.4, 1]}
          >
            <div className="ion-padding ion-margin-top">
              {modalDescBody.split("\n").map((s, i) => (
                <Fragment key={i}>
                  {s}
                  <br />
                </Fragment>
              ))}
            </div>
          </IonModal>
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
