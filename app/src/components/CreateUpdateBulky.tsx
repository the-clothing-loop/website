import {
  getPlatforms,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
  isPlatform,
} from "@ionic/react";
import type { IonModalCustomEvent } from "@ionic/core";
import { cloudUploadOutline, downloadOutline } from "ionicons/icons";
import { ChangeEvent, RefObject, useContext, useState } from "react";
import { BulkyItem, bulkyItemImage, bulkyItemPut } from "../api";
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
  const [isIos] = useState(() => isPlatform("ios"));
  const [isAndroid] = useState(() => isPlatform("android"));

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

  function handleClickUpload() {
    if (isIos) {
    } else if (isAndroid) {
    } else {
      const el = document.getElementById(
        "cu-bulky-web-image-upload"
      ) as HTMLInputElement | null;
      el?.click();
    }
  }

  async function handleWebUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    function getBase64(file: File) {
      return new Promise<string>((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }
    // https://pqina.nl/blog/convert-a-file-to-a-base64-string-with-javascript/#encoding-the-file-as-a-base-string
    const image64 = (await getBase64(file))
      .replace("data:", "")
      .replace(/^.+,/, "");

    const res = await bulkyItemImage(chain!.uid, image64);
    setBulkyImageURL(res.data.image);
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
            <IonLabel
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Image
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonLabel slot="start">Image URL</IonLabel>
            <IonInput
              className="ion-text-right"
              placeholder="image.jpg"
              type="url"
              value={bulkyImageURL}
              onIonChange={(e) => setBulkyImageURL(e.detail.value + "")}
              color={error === "image-url" ? "danger" : undefined}
            ></IonInput>
            {isAndroid || isIos ? null : (
              <input
                type="file"
                id="cu-bulky-web-image-upload"
                name="filename"
                className="ion-hide"
                onChange={handleWebUpload}
              />
            )}
          </IonItem>
          <IonItem lines="none">
            <IonButton
              onClick={handleClickUpload}
              size="default"
              style={{
                width: "100%",
              }}
              className="ion-margin-top ion-margin-bottom"
              expand="block"
            >
              <IonIcon
                icon={cloudUploadOutline}
                style={{ marginRight: "8px" }}
              />
              Upload
            </IonButton>
          </IonItem>
          <IonItem lines="none">
            {!!bulkyImageURL ? (
              <div
                style={{
                  paddingBottom: "16px",
                  textAlign: "center",
                }}
              >
                <IonImg
                  src={bulkyImageURL}
                  alt="the image to display"
                  style={{
                    maxWidth: "100%",
                    height: "300px",
                  }}
                />
              </div>
            ) : null}
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
