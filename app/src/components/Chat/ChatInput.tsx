import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  chevronDownCircle,
  colorPalette,
  globe,
  sendOutline,
  shirt,
} from "ionicons/icons";
import { useRef, useState } from "react";
import { Sleep } from "../../utils/sleep";
import { shirtOutline, add, addOutline } from "ionicons/icons";

export enum SendingMsgState {
  DEFAULT,
  SENDING,
  ERROR,
}
interface Props {
  onSendMessage: (msg: string) => Promise<void>;
}

// This follows the controller / view component pattern
export default function ChatInput(props: Props) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(SendingMsgState.DEFAULT);
  const modal = useRef<HTMLIonModalElement>(null);
  const addBulkyItem = useRef<HTMLIonSelectElement>(null);

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
  function handleClickPlus() {
    //setUpdateBulky(null);
    addBulkyItem.current?.open();
  }
  return (
    <>
    <div className="tw-bg-light">
          <IonFab slot="fixed" vertical="bottom" horizontal="start" color="light">
            <IonFabButton className="tw-h-7 tw-w-7 ">
              <IonIcon icon={addOutline}></IonIcon>
            </IonFabButton>
            <IonFabList side="top" className="tw-my-10 tw-h-7 tw-w-7 ">
              <IonFabButton size="small" className="tw-h-7 tw-w-7">
                <IonIcon icon={shirtOutline}></IonIcon>
              </IonFabButton>
            </IonFabList>
          </IonFab>
        <form className="tw-flex-shrink-0 tw-ml-6" onSubmit={onSubmit}>
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
        </form></div>
    </>
  );
}
