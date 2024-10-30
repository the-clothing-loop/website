import {
  IonButton,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonInput,
  IonItem,
  IonPopover,
} from "@ionic/react";
import { sendOutline } from "ionicons/icons";
import { MouseEvent, useContext, useRef, useState } from "react";
import { Sleep } from "../../utils/sleep";
import { addOutline } from "ionicons/icons";
import CreateBulky from "../CreateUpdateBulky";
import { BulkyItem } from "../../api/types";
import { StoreContext } from "../../stores/Store";
import BagSVG from "../../components/Bags/Svg";
import { useTranslation } from "react-i18next";
import { IonButtonCustomEvent, IonFabButtonCustomEvent } from "@ionic/core";

export enum SendingMsgState {
  DEFAULT,
  SENDING,
  ERROR,
}
interface Props {
  onSendMessage: (msg: string) => Promise<void>;
  onSendMessageWithImage: (msg: string, image: File) => Promise<void>;
}

// This follows the controller / view component pattern
export default function ChatInput(props: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(SendingMsgState.DEFAULT);
  const modal = useRef<HTMLIonModalElement>(null);
  const [updateBulky, setUpdateBulky] = useState<BulkyItem | null>(null);
  const { refresh } = useContext(StoreContext);

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
  }

  function handleClickPlus(e: MouseEvent) {
    setUpdateBulky(null);
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
                onClick={handleClickPlus}
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
                  onClick={(e) => handleClickFabText(e, handleClickPlus)}
                  className="tw-py-1 tw-px-4 tw-bg-light tw-rounded tw-opacity-80 hover:tw-opacity-100 tw-font-bold tw-text-sm"
                >
                  {t("createBulkyItem")}
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
              placeholder="Send Message"
              value={message}
              disabled={status == SendingMsgState.SENDING}
              onIonInput={(e) => setMessage(e.detail.value as string)}
              className="tw-ml-2"
            />
            <IonButton
              slot="end"
              shape="round"
              disabled={status !== SendingMsgState.DEFAULT}
              color="light"
              className="tw-mr-0"
              type="submit"
            >
              <IonIcon
                icon={sendOutline}
                color="primary"
                className="tw-text-2xl"
              />
            </IonButton>
          </IonItem>
        </form>
      </div>
      <CreateBulky
        modal={modal}
        didDismiss={() => refresh("bulky-items")}
        bulky={updateBulky}
        onSendBulkyItem={props.onSendMessageWithImage}
      />
    </>
  );
}
