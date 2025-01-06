import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { camera, cubeOutline, sendOutline } from "ionicons/icons";
import { MouseEvent, useContext, useRef, useState } from "react";
import { Sleep } from "../../utils/sleep";
import { addOutline } from "ionicons/icons";
import CreateBulky from "../CreateUpdateBulky";
import { BulkyItem } from "../../api/types";
import { StoreContext } from "../../stores/Store";
import BagSVG from "../../components/Bags/Svg";
import { useTranslation } from "react-i18next";
import { OnSendMessageWithImage } from "../../pages/Chat";

export enum SendingMsgState {
  DEFAULT,
  SENDING,
  ERROR,
}
interface Props {
  isOldBulkyItems: boolean;
  onSendMessage: (msg: string) => Promise<void>;
  onSendMessageWithImage: OnSendMessageWithImage;
}

// This follows the controller / view component pattern
export default function ChatInput(props: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(SendingMsgState.DEFAULT);
  const modal = useRef<HTMLIonModalElement>(null);
  const [updateBulky, setUpdateBulky] = useState<BulkyItem | null>(null);
  const { refresh } = useContext(StoreContext);
  const refChatInput = useRef<HTMLIonInputElement>(null);
  const [onlyPicture, setOnlyPicture] = useState(false);

  async function sendMessage() {
    setStatus(SendingMsgState.SENDING);
    try {
      await props.onSendMessage(message);
      setMessage("");
      setStatus(SendingMsgState.DEFAULT);
    } catch (e: any) {
      console.error("Error creating post", e);
      setStatus(SendingMsgState.ERROR);
      await Sleep(1000);
      setStatus(SendingMsgState.DEFAULT);
    }
  }

  function onSubmit(e: any) {
    e.preventDefault();
    sendMessage();
    setTimeout(() => {
      const el = refChatInput.current?.querySelector("input") as any;

      console.log("focus back", el);
      el?.focus();
    }, 100);
  }

  function onClickCreateBulky(e: MouseEvent) {
    setUpdateBulky(null);
    setOnlyPicture(false);
    modal.current?.present();
  }
  function onClickCreateOnlyPicture(e: MouseEvent) {
    setUpdateBulky(null);
    setOnlyPicture(true);
    modal.current?.present();
  }
  function handleClickFabText(
    e: MouseEvent,
    callback: (e: MouseEvent) => void,
  ) {
    const fab = (e.target as HTMLButtonElement).closest("ion-fab");
    fab?.toggle();
    callback(e);
  }
  return (
    <>
      {props.isOldBulkyItems ? (
        <form className="tw-flex-shrink-0 tw-bg-light" onSubmit={onSubmit}>
          <IonItem
            lines="none"
            color="light"
            button
            onClick={onClickCreateBulky}
            detail={false}
            detailIcon={addOutline}
            style={{
              "--detail-icon-color": "var(--ion-color-primary)",
              "--detail-icon-opacity": "1",
            }}
          >
            <IonIcon
              slot="start"
              className="tw-opacity-25"
              icon={cubeOutline}
            />
            <IonLabel>{t("createBulkyItem")}</IonLabel>
            <IonIcon slot="end" color="primary" icon={addOutline} />
          </IonItem>
        </form>
      ) : (
        <div className="tw-bg-light">
          <IonFab
            slot="fixed"
            vertical="bottom"
            horizontal="start"
            color="light"
            className="-tw-ml-3 -tw-mb-4"
          >
            <IonFabButton size="small" id="main-fab">
              <IonIcon icon={addOutline}></IonIcon>
            </IonFabButton>
            <IonFabList side="top" className="tw-mb-14">
              <div className="tw-relative">
                <IonFabButton
                  onClick={onClickCreateBulky}
                  size="small"
                  id="fab-bulky"
                >
                  <div className="tw-w-8 tw-h-8 tw-mb-1.5">
                    <BagSVG
                      bag={{ number: "", color: "var(--ion-color-primary)" }}
                      isList
                    />
                  </div>
                </IonFabButton>
                <div className="tw-absolute tw-top-0 tw-bottom-0 tw-left-full tw-w-[max-content] tw-flex tw-items-center">
                  <button
                    onClick={(e) => handleClickFabText(e, onClickCreateBulky)}
                    className="tw-py-1 tw-px-4 tw-bg-light tw-rounded tw-opacity-80 hover:tw-opacity-100 tw-font-bold tw-text-sm"
                  >
                    {t("createBulkyItem")}
                  </button>
                </div>
              </div>
              <div className="tw-relative">
                <IonFabButton
                  onClick={onClickCreateOnlyPicture}
                  size="small"
                  id="fab-bulky"
                >
                  <IonIcon size="lg" icon={camera} color="primary" />
                </IonFabButton>
                <div className="tw-absolute tw-top-0 tw-bottom-0 tw-left-full tw-w-[max-content] tw-flex tw-items-center">
                  <button
                    onClick={(e) =>
                      handleClickFabText(e, onClickCreateOnlyPicture)
                    }
                    className="tw-py-1 tw-px-4 tw-bg-light tw-rounded tw-opacity-80 hover:tw-opacity-100 tw-font-bold tw-text-sm"
                  >
                    {t("sendPicture")}
                  </button>
                </div>
              </div>
            </IonFabList>
          </IonFab>
          <form className="tw-flex-shrink-0 tw-ml-8" onSubmit={onSubmit}>
            <IonItem
              lines="none"
              color="light"
              disabled={status == SendingMsgState.SENDING}
            >
              <IonInput
                ref={refChatInput}
                placeholder="Send Message"
                value={message}
                disabled={status == SendingMsgState.SENDING}
                onIonInput={(e) => setMessage(e.detail.value as string)}
                className="tw-bg-background tw-my-1 tw-min-h-10 [&_*]:tw-ps-3"
              />
              <IonFabButton
                slot="end"
                disabled={status !== SendingMsgState.DEFAULT}
                size="small"
                className="tw-ms-0 tw-my-0 -tw-me-2"
                style={{
                  "--box-shadow": "none",
                  "--background": "var(--ion-color-light)",
                  "--background-hover": "var(--ion-color-primary-tint)",
                  "--color": "var(--ion-color-primary)",
                  "--color-hover": "var(--ion-color-base-light)",
                  "--color-focused": "var(--ion-color-base-light)",
                  "--color-activated": "var(--ion-color-base-light)",
                }}
                type="button"
                onClick={onSubmit}
              >
                <IonIcon icon={sendOutline} className="tw-text-2xl" />
              </IonFabButton>
            </IonItem>
          </form>
        </div>
      )}
      <CreateBulky
        onlyImage={onlyPicture}
        modal={modal}
        didDismiss={() => refresh("bulky-items")}
        bulky={updateBulky}
        onSendBulkyItem={props.onSendMessageWithImage}
      />
    </>
  );
}
