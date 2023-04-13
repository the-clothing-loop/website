import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  SelectChangeEventDetail,
} from "@ionic/react";

import type { IonSelectCustomEvent, IonModalCustomEvent } from "@ionic/core";
import { add, checkmarkCircle, ellipse, remove } from "ionicons/icons";
import { FormEvent, RefObject, useContext, useState } from "react";
import { bagColors, bagPut, BulkyItem, bulkyItemPut, UID } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";

const LINK_DETECTION_REGEX =
  /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;

export default function CreateUpdateBulky({
  bulky,
  didDismiss,
  modal,
}: {
  bulky: BulkyItem | null;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (
    e: IonModalCustomEvent<OverlayEventDetail<BulkyItem | null>>
  ) => void;
}) {
  const { chain, authUser } = useContext(StoreContext);
  const [bulkyTitle, setBulkyTitle] = useState("");
  const [bulkyMessage, setBulkyMessage] = useState("");
  const [bulkyImageURL, setBulkyImageURL] = useState("");
  const [error, setError] = useState("");

  function modalInit() {
    setBulkyTitle(bulky?.title || "");
    setBulkyMessage(bulky?.message || "");
    setBulkyImageURL(bulky?.image_url || "");
  }

  function cancel() {
    modal.current?.dismiss();
    setBulkyTitle("");
    setBulkyMessage("");
    setBulkyImageURL("");
  }
  async function createOrUpdate() {
    if (bulky) {
      if (!bulkyTitle) {
        setError("title");
        return;
      }
      if (!bulkyMessage) {
        setError("message");
        return;
      }
      if (!bulkyImageURL) {
        setError("image-url");
        return;
      }
    }
    if (bulkyImageURL && LINK_DETECTION_REGEX.test(bulkyImageURL)) {
      setError("image-url");
      return;
    }
    try {
      let body: Parameters<typeof bulkyItemPut>[0] = {
        chain_uid: chain!.uid,
        user_uid: authUser!.uid,
        title: bulkyTitle,
        message: bulkyMessage,
        image_url: bulkyImageURL,
      };
      if (bulky) body.id = bulky.id;
      await bulkyItemPut(body);

      setError("");

      modal.current?.dismiss("", "confirm");
    } catch (err: any) {
      setError(err.status);
    }
  }

  return (
    <IonModal
      ref={modal}
      onIonModalWillPresent={modalInit}
      onIonModalDidDismiss={didDismiss}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>{bulky ? "Update bag" : "Create bag"}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={createOrUpdate}
              color={!error ? "primary" : "danger"}
            >
              {bulky ? "Update" : "Create"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem lines="none">
            <IonLabel className="ion-text-wrap">
              The next bag number is automatically selected
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonLabel slot="start">Title</IonLabel>
            <IonInput
              className="ion-text-right"
              type="text"
              value={bulkyTitle}
              onIonChange={(e) => setBulkyTitle(e.detail.value + "")}
              color={error === "title" ? "danger" : undefined}
            ></IonInput>
          </IonItem>
          <IonItem lines="none">
            <IonLabel slot="start">Message</IonLabel>
            <IonInput
              className="ion-text-right"
              type="text"
              value={bulkyMessage}
              onIonChange={(e) => setBulkyMessage(e.detail.value + "")}
              color={error === "message" ? "danger" : undefined}
            ></IonInput>
          </IonItem>
          <IonItem lines="none">
            <IonLabel slot="start">Image</IonLabel>
            <IonInput
              className="ion-text-right"
              placeholder="https://..."
              type="text"
              value={bulkyImageURL}
              onIonChange={(e) => setBulkyImageURL(e.detail.value + "")}
              color={error === "image-url" ? "danger" : undefined}
            ></IonInput>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
