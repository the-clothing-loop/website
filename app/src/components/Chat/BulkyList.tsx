import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonText,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { Fragment, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../../toastError";
import { BulkyItem, User } from "../../api/types";
import { bulkyItemPut, bulkyItemRemove } from "../../api/bulky";
import { StoreContext } from "../../stores/Store";
import CreateUpdateOldBulky from "../CreateUpdateOldBulky";
import { uploadImageFile } from "../../api/imgbb";
import { EVENT_IMAGE_EXPIRATION } from "../../api/event";
import { addOutline, cubeOutline } from "ionicons/icons";

export default function BulkyList(props: {}) {
  const { t } = useTranslation();
  const {
    chain,
    chainUsers,
    bulkyItems,
    authUser,
    //   getChainHeader,
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

  function handleClickDelete(id: number) {
    const handler = async () => {
      await bulkyItemRemove(chain!.uid, authUser!.uid, id).catch((err) => {
        toastError(present, err);
      });
      await refresh("bulky-items");
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

  async function onSubmitBulky(
    title: string,
    message: string,
    file: File | null | undefined,
  ) {
    if (!authUser) throw "Not logged in";
    if (!chain) throw "Must select a loop before sending";

    let image_url = "";
    if (file)
      image_url = await uploadImageFile(file, 800, EVENT_IMAGE_EXPIRATION).then(
        (r) => r.data.image,
      );

    const bulkyItemPutBody: Parameters<typeof bulkyItemPut>[0] =
      updateBulky || {
        chain_uid: chain.uid,
        user_uid: authUser.uid,
      };
    bulkyItemPutBody.title = title;
    bulkyItemPutBody.message = message;
    if (image_url) bulkyItemPutBody.image_url = image_url;
    await bulkyItemPut(bulkyItemPutBody);
    await refresh("bulky-items");
  }

  function handleClickReadMore(bulkyItem: BulkyItem) {
    setModalDesc(bulkyItem);
    refModalDesc.current?.present();
  }

  function onClickCreate() {
    setUpdateBulky(null);

    setTimeout(() => {
      modal.current?.present();
    });
  }

  function handleClickEdit(b: BulkyItem) {
    setUpdateBulky(b);

    setTimeout(() => {
      modal.current?.present();
    });
  }
  function handleClickReserve(user: User, bulkyItemName: string) {
    const handler = (type: "sms" | "whatsapp" | "telegram" | "signal") => {
      let phone = user.phone_number.replaceAll(/[^\d]/g, "");
      let message = window.encodeURI(
        t("imInterestedInThisBulkyItem", { name: bulkyItemName }),
      );
      console.info("phone", phone, "message", message);

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
    <>
      <div
        className={`tw-relative tw-overflow-y-auto tw-flex tw-flex-grow  ${
          isThemeDefault ? " tw-bg-blue-contrast" : ""
        }`}
      >
        <div className="tw-flex-1">
          {bulkyItems.map((bulkyItem, i) => {
            const user = chainUsers.find((u) => u.uid === bulkyItem.user_uid);
            if (!user) return null;
            const isMe = authUser?.uid === user.uid;
            let createdAt = new Date(bulkyItem.created_at);
            let shouldExpandText =
              bulkyItem.message.length > 50 ||
              bulkyItem.message.split("\n").length > 4;

            return (
              <div className="tw-pt-4 tw-px-4 last:tw-pb-4">
                <IonCard
                  key={bulkyItem.id}
                  className={"tw-bg-light tw-m-0 tw-z-10 tw-rounded-none".concat(
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
                    <IonText className="tw-text-dark tw-py-[3px]"></IonText>
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
                      </IonText>
                    </IonItem>
                    <IonItem
                      className="tw-my-0 -tw-mx-4"
                      color="background"
                      lines="none"
                    >
                      <IonLabel
                        onClick={
                          shouldExpandText
                            ? () => handleClickReadMore(bulkyItem)
                            : undefined
                        }
                      >
                        <div
                          className={
                            shouldExpandText
                              ? "tw-max-h-16 tw-overflow-hidden"
                              : ""
                          }
                        >
                          <h3 className="ion-no-margin !tw-font-bold tw-text-lg tw-leading-5">
                            {t("description")}
                          </h3>
                          <p className={`ion-text-wrap tw-opacity-60`}>
                            {bulkyItem.message}
                          </p>
                        </div>
                        {shouldExpandText ? (
                          <span className="tw-mt-[-3px] tw-text-sm tw-leading-5 tw-font-semibold tw-block tw-text-primary tw-cursor-pointer">
                            {t("readMore")}
                          </span>
                        ) : null}
                      </IonLabel>
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
              </div>
            );
          })}
        </div>
        {/*
      </div>
      */}

        <div className="tw-absolute tw-overflow-hidden tw-inset-0">
          {/* Background SVGs */}
          <IonIcon
            aria-hidden="true"
            icon="/v2_o.svg"
            style={{ fontSize: 500 }}
            color={isThemeDefault ? "" : "light"}
            className="tw-absolute tw-right-[180px] -tw-top-[20px] tw-text-blue-tint dark:tw-text-blue-shade"
          />
        </div>
      </div>

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

      <div className="tw-flex-shrink-0 tw-bg-light" key="create">
        <IonItem
          lines="none"
          color="light"
          button
          onClick={onClickCreate}
          detail={false}
          detailIcon={addOutline}
          style={{
            "--detail-icon-color": "var(--ion-color-primary)",
            "--detail-icon-opacity": "1",
          }}
        >
          <IonIcon slot="start" className="tw-opacity-25" icon={cubeOutline} />
          <IonLabel>{t("createBulkyItem")}</IonLabel>
          <IonIcon slot="end" color="primary" icon={addOutline} />
        </IonItem>
      </div>
      <CreateUpdateOldBulky
        modal={modal}
        didDismiss={() => refresh("bulky-items")}
        bulky={updateBulky}
        onSubmitBulky={onSubmitBulky}
      />
    </>
  );
}
