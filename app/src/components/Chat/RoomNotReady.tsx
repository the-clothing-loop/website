import { isPlatform } from "@ionic/core";
import { IonButton, IonIcon } from "@ionic/react";
import { alertCircleOutline } from "ionicons/icons";
import { useState } from "react";

interface Props {
  isChainAdmin: boolean;
  onClickEnable: () => void;
}

// This follows the controller / view component pattern
export default function RoomNotReady(props: Props) {
  const [isAndroid] = useState(() => isPlatform("android"));
  if (isAndroid) {
    return (
      <div className="tw-flex tw-flex-col tw-h-full tw-justify-center tw-text-center tw-items-center">
        <IonIcon icon={alertCircleOutline} size="large" />
        <h1>
          Chat is not ready
          <br /> for the android platform
        </h1>
        <p>The bulky items are still available from the top bar</p>
      </div>
    );
  }

  return (
    <div className="tw-flex tw-flex-col tw-h-full tw-justify-center tw-items-center">
      <h1>Chat is not enabled</h1>
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
