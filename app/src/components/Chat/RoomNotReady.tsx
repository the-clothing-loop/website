import { IonButton } from "@ionic/react";

interface Props {
  isChainAdmin: boolean;
  onClickEnable: () => void;
}

// This follows the controller / view component pattern
export default function RoomNotReady(props: Props) {
  return (
    <div className="tw-flex tw-flex-col tw-h-full tw-justify-center tw-items-center">
      <h1>Room is not enabled</h1>
      {props.isChainAdmin ? (
        <>
          <p>Allow members to chat with each other</p>
          <IonButton
            type="button"
            color="light"
            className="tw-mt-4"
            onClick={props.onClickEnable}
          >
            Enable
          </IonButton>
        </>
      ) : (
        <p>Ask your Loop host to enable chat</p>
      )}
    </div>
  );
}
