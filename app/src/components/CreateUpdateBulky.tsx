import {
  IonButton,
  IonButtons,
  IonCard,
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
import {
  checkmarkOutline,
  cloudUploadOutline,
  hourglassOutline,
  imageOutline,
} from "ionicons/icons";
import { ChangeEvent, RefObject, useContext, useState } from "react";
import { BulkyItem, uploadImage, bulkyItemPut } from "../api";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import { Camera, CameraResultType } from "@capacitor/camera";

enum State {
  idle,
  error,
  success,
  loading,
}

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
  const [isCapacitor] = useState(() => isPlatform("capacitor"));
  const [loadingUpload, setLoadingUpload] = useState(State.loading);
  const [present] = useIonToast();

  function modalInit() {
    setBulkyTitle(bulky?.title || "");
    setBulkyMessage(bulky?.message || "");
    setBulkyImageURL(bulky?.image_url || "");
    setLoadingUpload(State.idle);
  }

  function cancel() {
    modal.current?.dismiss();
    setBulkyTitle("");
    setBulkyMessage("");
    setBulkyImageURL("");
    setLoadingUpload(State.idle);
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
    if (isCapacitor) {
      setLoadingUpload(State.loading);
      handleNativeUpload()
        .then(() => {
          setLoadingUpload(State.success);
          setTimeout(() => {
            setLoadingUpload(State.idle);
          }, 2000);
        })
        .catch((err) => {
          toastError(present, err);
          setLoadingUpload(State.error);
        });
    } else {
      const el = document.getElementById(
        "cu-bulky-web-image-upload",
      ) as HTMLInputElement | null;
      el?.click();
    }
  }

  function handleWebUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingUpload(State.loading);

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

    (async () => {
      // https://pqina.nl/blog/convert-a-file-to-a-base64-string-with-javascript/#encoding-the-file-as-a-base-string
      const image64 = await getBase64(file);

      const res = await uploadImage(image64, 800);
      setBulkyImageURL(res.data.image);
    })()
      .then(() => {
        setLoadingUpload(State.success);
        setTimeout(() => {
          setLoadingUpload(State.idle);
        }, 2000);
      })
      .catch(() => {
        setLoadingUpload(State.error);
      });
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
              type="text"
              autoCorrect="on"
              autoCapitalize="words"
              enterkeyhint="next"
              label={t("title")}
              labelPlacement="start"
              value={bulkyTitle}
              onIonInput={(e) => setBulkyTitle(e.detail.value + "")}
            ></IonInput>
          </IonItem>
          <IonItem
            lines="inset"
            color={error === "message" ? "danger" : undefined}
          >
            <IonTextarea
              className="ion-margin-bottom"
              label={t("message")}
              labelPlacement="start"
              spellCheck="true"
              autoGrow
              autoCapitalize="sentences"
              autoCorrect="on"
              enterkeyhint="next"
              value={bulkyMessage}
              onIonInput={(e) => setBulkyMessage(e.detail.value + "")}
            />
          </IonItem>
          <IonItem
            color={error === "image-url" ? "danger" : undefined}
            lines="none"
          >
            <div style={{ width: "100%" }}>
              <IonLabel style={{ marginTop: 8, marginBottom: 16 }}>
                {t("image")}
              </IonLabel>
              <IonButton
                onClick={handleClickUpload}
                size="default"
                style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
                expand="block"
                color={
                  loadingUpload === State.idle
                    ? "primary"
                    : loadingUpload === State.loading
                    ? "light"
                    : loadingUpload === State.success
                    ? "success"
                    : "warning"
                }
              >
                <IonIcon
                  icon={
                    loadingUpload === State.loading
                      ? hourglassOutline
                      : loadingUpload === State.success
                      ? checkmarkOutline
                      : cloudUploadOutline
                  }
                  style={{ marginRight: "8px" }}
                  size="default"
                />
                {loadingUpload === State.loading
                  ? t("loading")
                  : loadingUpload === State.error
                  ? "Error"
                  : loadingUpload === State.success
                  ? t("uploaded")
                  : t("upload")}
              </IonButton>
              {isCapacitor ? null : (
                <input
                  type="file"
                  id="cu-bulky-web-image-upload"
                  name="filename"
                  className="ion-hide"
                  onChange={handleWebUpload}
                />
              )}
            </div>
          </IonItem>
          <IonItem lines="none">
            <div
              style={{
                marginBottom: "16px",
                textAlign: "center",
                width: "100%",
              }}
            >
              {!(loadingUpload === State.loading) && bulkyImageURL ? (
                <IonCard
                  onClick={handleClickUpload}
                  style={{
                    margin: "0 50px",
                    border: "1px solid",
                    borderColor: loadingUpload
                      ? "var(--ion-color-medium)"
                      : "var(--ion-color-primary)",
                  }}
                >
                  <IonImg
                    src={bulkyImageURL}
                    alt={t("loading")}
                    style={{
                      maxWidth: "100%",
                    }}
                  />
                </IonCard>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "300px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IonCard
                    onClick={handleClickUpload}
                    style={{
                      border: "1px solid",
                      borderColor:
                        loadingUpload === State.loading
                          ? "var(--ion-color-medium)"
                          : "var(--ion-color-primary)",
                      width: 200,
                      height: 200,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <IonIcon size="large" icon={imageOutline} />
                      {loadingUpload === State.loading ? (
                        <IonIcon
                          icon={hourglassOutline}
                          size="small"
                          color="primary"
                          style={{
                            backgroundColor:
                              "var(--ion-color-primary-contrast)",
                            padding: 2,
                            borderRadius: "50%",
                            position: "absolute",
                            bottom: -9,
                            right: -11,
                          }}
                        />
                      ) : null}
                    </div>
                  </IonCard>
                </div>
              )}
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
