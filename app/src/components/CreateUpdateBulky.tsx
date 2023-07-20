import {
  CreateAnimation,
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
  IonTextarea,
  IonTitle,
  IonToolbar,
  isPlatform,
  useIonToast,
} from "@ionic/react";
import type { IonModalCustomEvent } from "@ionic/core";
import { cloudUploadOutline, syncOutline } from "ionicons/icons";
import { ChangeEvent, RefObject, useContext, useState } from "react";
import { BulkyItem, uploadImage, bulkyItemPut } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import { Camera, CameraResultType } from "@capacitor/camera";

export default function CreateUpdateBulky({
  bulky,
  didDismiss,
  modal,
}: {
  bulky: BulkyItem | null;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (
    e: IonModalCustomEvent<OverlayEventDetail<BulkyItem | null>>,
  ) => void;
}) {
  const { t } = useTranslation();
  const { chain, authUser } = useContext(StoreContext);
  const [bulkyTitle, setBulkyTitle] = useState("");
  const [bulkyMessage, setBulkyMessage] = useState("");
  const [bulkyImageURL, setBulkyImageURL] = useState("");
  const [error, setError] = useState("");
  const [isIos] = useState(() => isPlatform("ios"));
  const [isAndroid] = useState(() => isPlatform("android"));
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [present] = useIonToast();

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
      toastError(present, err);
    }
  }

  function handleClickUpload() {
    console.log("upload clicked");

    if (isIos || isAndroid) {
      setLoadingUpload(true);
      handleNativeUpload()
        .catch((err) => {
          toastError(present, err);
        })
        .finally(() => {
          setLoadingUpload(false);
        });
    } else {
      const el = document.getElementById(
        "cu-bulky-web-image-upload",
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
        reader.onload = () =>
          resolve(
            (reader.result as string).replace("data:", "").replace(/^.+,/, ""),
          );
        reader.onerror = (error) => reject(error);
      });
    }
    // https://pqina.nl/blog/convert-a-file-to-a-base64-string-with-javascript/#encoding-the-file-as-a-base-string
    const image64 = await getBase64(file);

    const res = await uploadImage(image64, 800);
    setBulkyImageURL(res.data.image);
  }

  async function handleNativeUpload() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
    });
    if (!photo.base64String) throw "Image not found";

    const res = await uploadImage(photo.base64String, 800);
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
            <IonButton onClick={cancel}>{t("cancel")}</IonButton>
          </IonButtons>
          <IonTitle>
            {bulky ? t("updateBulkyItem") : t("createBulkyItem")}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={createOrUpdate}
              color={!error ? "primary" : "danger"}
            >
              {bulky ? t("update") : t("create")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem color={error === "title" ? "danger" : undefined}>
            <IonInput
              className="ion-text-right"
              type="text"
              autoCorrect="on"
              autoCapitalize="words"
              enterkeyhint="next"
              label={t("title")}
              value={bulkyTitle}
              onIonChange={(e) => setBulkyTitle(e.detail.value + "")}
            ></IonInput>
          </IonItem>
          <IonItem
            lines="none"
            color={error === "message" ? "danger" : undefined}
          >
            <IonTextarea
              className="ion-margin-bottom ion-margin-top"
              label={t("message")}
              labelPlacement="stacked"
              color="light"
              style={{
                backgroundColor: "var(--ion-color-light)",
                color: "var(--ion-color-light-contrast)",
                borderRadius: "8px",
                padding: 8,
                paddingTop: 0,
              }}
              spellCheck="true"
              autoGrow
              autoCapitalize="sentences"
              autoCorrect="on"
              enterkeyhint="next"
              value={bulkyMessage}
              onIonChange={(e) => setBulkyMessage(e.detail.value + "")}
            />
          </IonItem>
          <IonItem lines="none">
            <IonLabel
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {t("image")}
            </IonLabel>
          </IonItem>
          <IonItem
            lines="none"
            color={error === "image-url" ? "danger" : undefined}
          >
            <IonLabel slot="start">{t("imageURL")}</IonLabel>
            <IonInput
              className="ion-text-right"
              placeholder="image.jpg"
              type="url"
              value={bulkyImageURL}
              onIonChange={(e) => setBulkyImageURL(e.detail.value + "")}
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
          <IonItem
            lines="none"
            color={error === "image-url" ? "danger" : undefined}
          >
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
              {t("upload")}
              <CreateAnimation
                duration={1000}
                iterations={Infinity}
                play
                fromTo={{
                  property: "transform",
                  fromValue: "rotate(0deg)",
                  toValue: "rotate(360deg)",
                }}
              >
                <IonIcon
                  size="default"
                  className={loadingUpload ? "" : "ion-hide"}
                  style={{ marginLeft: "8px" }}
                  icon={syncOutline}
                />
              </CreateAnimation>
            </IonButton>
          </IonItem>
          <IonItem lines="none">
            {!!bulkyImageURL ? (
              <div
                style={{
                  marginBottom: "16px",
                  textAlign: "center",
                  width: "100%",
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
