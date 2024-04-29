import { IonButton, IonIcon, IonInput, IonItem } from "@ionic/react";
import { sendOutline } from "ionicons/icons";
import { useState } from "react";
import { Sleep } from "../../utils/sleep";

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

  return (
    <form className="tw-flex-shrink-0" onSubmit={onSubmit}>
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
          <IonIcon icon={sendOutline} color="primary" className="tw-text-2xl" />
        </IonButton>
      </IonItem>
    </form>
  );
}
