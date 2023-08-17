import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
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
import { chatbubbleEllipsesSharp } from "ionicons/icons";
import { Fragment, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../toastError";
import { bulkyItemRemove, BulkyItem, User } from "../api";
import CreateUpdateBulky from "../components/CreateUpdateBulky";
import { StoreContext } from "../Store";
import { Clipboard } from "@capacitor/clipboard";

export default function BulkyList() {
  const { t } = useTranslation();
  const {
    chain,
    chainUsers,
    bulkyItems,
    setChain,
    authUser,
    isChainAdmin,
    refresh,
  } = useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();
  const [present] = useIonToast();
  const [updateBulky, setUpdateBulky] = useState<BulkyItem | null>(null);
  const [modalDesc, setModalDesc] = useState({ title: "", message: "" });
  const refModalDesc = useRef<HTMLIonModalElement>(null);

  function handleClickDelete(id: number) {
    const handler = async () => {
      await bulkyItemRemove(chain!.uid, authUser!.uid, id).catch((err) => {
        toastError(present, err);
      });
      await setChain(chain, authUser!.uid);
    };
    presentAlert({
      header: t("deleteBulkyItem"),
      message: t("areYouSureYouWantToDeleteThisBulkyItem"),
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

  function handleClickReadMore(bulkyItem: BulkyItem) {
    setModalDesc(bulkyItem);
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
      type: "sms" | "whatsapp" | "telegram" | "signal" | "copy",
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
        case "copy":
          Clipboard.write({
            string: user.phone_number,
          });
          present({
            message: t("copiedToClipboard"),
            color: "primary",
            duration: 1300,
          });
          break;
      }
    };
    let buttons = [
      {
        text: t("copy"),
        role: "submit",
        cssClass: "!tw-font-bold",
        handler: () => handler("copy"),
      },
      {
        text: "SMS",
        role: "submit",
        cssClass: "!tw-font-bold",
        handler: () => handler("sms"),
      },
      {
        text: "Telegram",
        role: "submit",
        cssClass: "!tw-font-bold",
        handler: () => handler("telegram"),
      },
      {
        text: "Signal",
        role: "submit",
        cssClass: "!tw-font-bold",
        handler: () => handler("signal"),
      },
      {
        text: "WhatsApp",
        role: "submit",
        cssClass: "!tw-font-bold",
        handler: () => handler("whatsapp"),
      },
      {
        text: t("close"),
        role: "cancel",
        cssClass: "!tw-font-normal",
      },
    ];

    presentAlert({
      header: t("ifYouAreInterestedPleaseSendAMessage", {
        name: user.name,
      }),
      buttons,
    });
  }
  function onImgErrorHideAlt(e: any) {
    e.target.style.display = "none";
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("bulkyItemsTitle")}</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleClickCreate}>{t("create")}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("bulkyItemsTitle")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div>
          {bulkyItems.map((bulkyItem, i) => {
            const user = chainUsers.find((u) => u.uid === bulkyItem.user_uid);
            if (!user) return null;
            const isMe = authUser?.uid === user.uid;
            let createdAt = new Date(bulkyItem.created_at);
            let shouldExpandText =
              bulkyItem.message.length > 50 ||
              bulkyItem.message.split("\n").length > 4;

            return (
              <IonCard key={bulkyItem.id}>
                {bulkyItem.image_url ? (
                  <div
                    className={`tw-relative tw-min-h-[124px] ${
                      i % 2 === 0
                        ? "tw-bg-primary-shade"
                        : "tw-bg-secondary-shade"
                    }`}
                  >
                    <IonCardSubtitle
                      color="light"
                      style={{
                        textShadow:
                          "1px 0 10px var(--ion-color-dark), 0 0 0.2em var(--ion-color-dark)",
                      }}
                      className="tw-absolute tw-top-0 tw-left-0 tw-right-0 tw-pt-3 tw-px-5 tw-text-base tw-leading-5"
                    >
                      {createdAt.toLocaleDateString()}
                    </IonCardSubtitle>
                    <img
                      alt={bulkyItem.title}
                      src={bulkyItem.image_url}
                      className="tw-block"
                      onError={onImgErrorHideAlt}
                    />
                    <IonCardTitle
                      color="light"
                      style={{
                        textShadow:
                          "1px 0 10px var(--ion-color-dark), 0 0 0.2em var(--ion-color-dark)",
                      }}
                      className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-pt-0 tw-p-5"
                    >
                      {bulkyItem.title}
                    </IonCardTitle>
                  </div>
                ) : null}
                <IonCardContent className="tw-pb-[5px]">
                  <IonText
                    onClick={
                      shouldExpandText
                        ? () => handleClickReadMore(bulkyItem)
                        : undefined
                    }
                    className="tw-text-dark tw-py-[3px]"
                  >
                    <p
                      className={`tw-text-base tw-leading-5 tw-whitespace-pre-wrap tw-overflow-hidden tw-block ${
                        shouldExpandText ? "tw-max-h-[46px]" : ""
                      }`}
                    >
                      {bulkyItem.message}
                    </p>
                    {shouldExpandText ? (
                      <span className="tw-mt-[-3px] tw-text-sm tw-leading-5 tw-font-semibold tw-block tw-text-primary">
                        {t("readMore")}
                      </span>
                    ) : null}
                  </IonText>
                  <IonItem
                    lines="none"
                    routerLink={"/address/" + user.uid}
                    className="tw-my-0 -tw-mx-4"
                  >
                    <IonText className="tw-my-2 ty-mx-0">
                      <h3 className="ion-no-margin !tw-font-bold tw-text-lg tw-leading-5">
                        {user.name}
                      </h3>
                      <p className="ion-text-wrap tw-opacity-60">
                        {user.address}
                      </p>
                    </IonText>
                  </IonItem>
                </IonCardContent>

                <div className="tw-flex tw-justify-between">
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
                      className="tw-font-bold"
                      onClick={() => handleClickReserve(user, bulkyItem.title)}
                    >
                      {t("reserve")}
                      <IonIcon
                        slot="end"
                        icon={chatbubbleEllipsesSharp}
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
            initialBreakpoint={0.6}
            breakpoints={[0, 0.6, 1]}
          >
            <div className="ion-padding tw-text-lg tw-leading-6">
              <h1 className="tw-mt-0">{modalDesc.title}</h1>
              {modalDesc.message.split("\n").map((s, i) => (
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
          didDismiss={() => refresh("bulky-items")}
          bulky={updateBulky}
        />
      </IonContent>
    </IonPage>
  );
}
