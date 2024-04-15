import { IonButton, IonIcon, IonInput, IonItem } from "@ionic/react";
import { sendOutline } from "ionicons/icons";

export enum SendingMsgState {
  DEFAULT,
  SENDING,
  ERROR,
}
interface Props {
  sendingMsg: SendingMsgState;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => Promise<void>;
}

export default function ChatInput({
  sendingMsg,
  message,
  setMessage,
  sendMessage,
}: Props) {
  return (
    <div className="tw-flex-shrink-0">
      <IonItem color="light" disabled={sendingMsg == SendingMsgState.SENDING}>
        <IonInput
          placeholder="Send Message"
          value={message}
          disabled={sendingMsg == SendingMsgState.SENDING}
          onIonInput={(e) => setMessage(e.detail.value as string)}
          className="tw-ml-2"
        />
        <IonButton
          slot="end"
          onClick={sendMessage}
          shape="round"
          disabled={message == ""}
          color="light"
          className="tw-mr-0"
        >
          <IonIcon icon={sendOutline} color="primary" className="tw-text-2xl" />
        </IonButton>
      </IonItem>
    </div>
  );
}
