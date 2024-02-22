import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
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
import { chatbubbleEllipsesSharp, pencilOutline } from "ionicons/icons";
import { Fragment, useContext, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../toastError";
import { bulkyItemRemove, BulkyItem, User } from "../api";
import CreateUpdateBulky from "../components/CreateUpdateBulky";
import { StoreContext } from "../Store";
import { Clipboard } from "@capacitor/clipboard";
import OverlayPaused from "../components/OverlayPaused";
import OverlayAppDisabled from "../components/OverlayChainAppDisabled";
import EditHeaders, { getHeader } from "../components/EditHeaders";
import { useLongPress } from "use-long-press";

export default function BulkyList() {
  const { t } = useTranslation();
  const {
    chain,
    chainUsers,
    bulkyItems,
    setChain,
    authUser,
    isChainAdmin,
    isThemeDefault,
    refresh,
    shouldBlur,
  } = useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();
  const [present] = useIonToast();
  const [updateBulky, setUpdateBulky] = useState<BulkyItem | null>(null);
  const [modalDesc, setModalDesc] = useState({ title: "", message: "" });
  const refModalDesc = useRef<HTMLIonModalElement>(null);
  const headerSheetModal = useRef<HTMLIonModalElement>(null);

  const longPressHeader = useLongPress(() => {
    headerSheetModal.current?.present();
  });

  const headerKey = "bulkyList";

  const header = useMemo(() => {
    return getHeader(chain, headerKey) || t("bulkyItemsTitle");
  }, [chain]);

  function refreshChain() {
    setChain(chain?.uid, authUser);
  }

  function handleClickDelete(id: number) {
    const handler = async () => {
      await bulkyItemRemove(chain!.uid, authUser!.uid, id).catch((err) => {
        toastError(present, err);
      });
      await setChain(chain?.uid, authUser);
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
    const handler = (type: "sms" | "whatsapp" | "telegram" | "signal") => {
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
      <OverlayPaused />
      <OverlayAppDisabled />
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("bulkyItemsTitle")}</IonTitle>
          <IonButtons
            slot="end"
            className={`${isThemeDefault ? "tw-text-blue" : "primary"}`}
          >
            <IonButton
              onClick={handleClickCreate}
              color={isThemeDefault ? "tw-text-blue" : "primary"}
            >
              {t("create")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        class={isThemeDefault ? "tw-bg-blue-contrast" : ""}
      >
        <IonHeader collapse="condense">
          <IonToolbar className="tw-bg-transparent">
            {isChainAdmin ? (
              <IonTitle
                size="large"
                className={"tw-font-serif tw-font-bold".concat(
                  isThemeDefault ? " tw-text-blue" : "",
                )}
                {...longPressHeader()}
              >
                {header}

                <IonIcon
                  icon={pencilOutline}
                  className="tw-text-sm tw-ml-1.5 tw-mb-3.5"
                />
              </IonTitle>
            ) : (
              <IonTitle
                size="large"
                className={"tw-font-serif tw-font-bold".concat(
                  isThemeDefault ? " tw-text-blue" : "",
                )}
              >
                {header}
              </IonTitle>
            )}
          </IonToolbar>
        </IonHeader>
        {bulkyItems.map((bulkyItem, i) => {
          const user = chainUsers.find((u) => u.uid === bulkyItem.user_uid);
          if (!user) return null;
          const isMe = authUser?.uid === user.uid;
          let createdAt = new Date(bulkyItem.created_at);
          let shouldExpandText =
            bulkyItem.message.length > 50 ||
            bulkyItem.message.split("\n").length > 4;

          return (
            <IonCard
              key={bulkyItem.id}
              className={"tw-bg-light tw-rounded-none".concat(
                shouldBlur ? " tw-blur" : "",
              )}
              color={"background"}
            >
              {bulkyItem.image_url ? (
                <div
                  className={`tw-relative tw-min-h-[124px] ${
                    i % 2 === 0
                      ? "tw-bg-primary-shade"
                      : "tw-bg-secondary-shade"
                  }`}
                >
                  <img
                    alt={bulkyItem.title}
                    src={bulkyItem.image_url}
                    className="tw-block"
                    onError={onImgErrorHideAlt}
                  />
                </div>
              ) : null}
              <IonCardContent className="tw-pb-[5px]">
                <div className="tw-flex tw-flex-row tw-justify-between tw-mb-6">
                  <IonText color="dark" className="tw-text-3xl ">
                    {bulkyItem.title}
                  </IonText>
                  <IonText
                    color="dark"
                    className="tw-text-md tw-self-end tw-pb-1"
                  >
                    {createdAt.toLocaleDateString()}
                  </IonText>
                </div>
                <IonText
                  onClick={
                    shouldExpandText
                      ? () => handleClickReadMore(bulkyItem)
                      : undefined
                  }
                  className="tw-text-dark tw-py-[3px]"
                ></IonText>
                <IonItem
                  lines="none"
                  routerLink={"/address/" + user.uid}
                  className="tw-my-0 -tw-mx-4"
                  color="background"
                >
                  <IonText>
                    <div className="tw-mb-4">
                      <h3 className="ion-no-margin !tw-font-bold tw-text-lg tw-leading-5">
                        {t("address")}
                      </h3>
                      <p className="ion-text-wrap tw-opacity-60">
                        {user.address}
                      </p>
                    </div>
                    {shouldExpandText ? (
                      <span className="tw-mt-[-3px] tw-text-sm tw-leading-5 tw-font-semibold tw-block tw-text-primary">
                        {t("readMore")}
                      </span>
                    ) : null}
                    <div className="tw-mb-4">
                      <h3 className="ion-no-margin !tw-font-bold tw-text-lg tw-leading-5">
                        {t("description")}
                      </h3>
                      <p
                        className={`ion-text-wrap tw-opacity-60  ${
                          shouldExpandText ? "tw-max-h-[46px]" : ""
                        }`}
                      >
                        {bulkyItem.message}
                      </p>
                    </div>
                  </IonText>
                </IonItem>
              </IonCardContent>

              <IonButtons className="tw-flex tw-justify-around ion-margin-bottom ion-margin-horizontal ">
                {isMe || isChainAdmin ? (
                  <>
                    <IonButton
                      fill="clear"
                      className="tw-font-bold tw-w-1/3"
                      onClick={() => handleClickEdit(bulkyItem)}
                      color="secondary"
                    >
                      {t("edit")}
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="danger"
                      className="tw-font-bold tw-w-1/3"
                      onClick={() => handleClickDelete(bulkyItem.id)}
                    >
                      {t("delete")}
                    </IonButton>
                  </>
                ) : null}
                <IonButton
                  slot="end"
                  fill="clear"
                  color="warning"
                  className="tw-font-bold tw-w-1/3"
                  onClick={() => handleClickReserve(user, bulkyItem.title)}
                >
                  {t("contact")}
                </IonButton>
              </IonButtons>
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

        {isChainAdmin ? (
          <EditHeaders
            modal={headerSheetModal}
            didDismiss={refreshChain}
            headerKey={headerKey}
            initalHeader={header}
          />
        ) : null}
        <div className="relative">
          {/* Background SVGs */}
          <IonIcon
            aria-hidden="true"
            icon="/v2_o.svg"
            style={{ fontSize: 500 }}
            color={isThemeDefault ? "" : "light"}
            className="tw-absolute tw-right-[180px] -tw-top-[20px] -tw-z-10 tw-text-blue-tint dark:tw-text-blue-shade"
          />
        </div>
      </IonContent>

      <CreateUpdateBulky
        modal={modal}
        didDismiss={() => refresh("bulky-items")}
        bulky={updateBulky}
      />
    </IonPage>
  );
}
