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
import { ChangeEvent, RefObject, useRef, useState } from "react";
import { BulkyItem } from "../api/typex2";
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

export type OnSubmitOldBulky = (
  title: string,
  message: string,
  file?: File | undefined | null,
) => Promise<void>;

export default function CreateUpdateOldBulky({
  bulky,
  didDismiss,
  modal,
  onSubmitBulky,
}: {
  bulky: BulkyItem | null;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (
    e: IonModalCustomEvent<OverlayEventDetail<BulkyItem | null>>,
  ) => void;
  onSubmitBulky: OnSubmitOldBulky;
}) {
  const { t } = useTranslation();
  const [bulkyTitle, setBulkyTitle] = useState("");
  const [bulkyMessage, setBulkyMessage] = useState("");
  const [imageData, setImageData] = useState<string>();
  const [image, setImage] = useState<File>();
  const [error, setError] = useState("");
  const [isCapacitor] = useState(() => isPlatform("capacitor"));
  const [loadingUpload, setLoadingUpload] = useState(State.loading);
  const [present] = useIonToast();
  const refScrollRoot = useRef<HTMLDivElement>(null);

  function modalInit() {
    setBulkyTitle(bulky?.title || "");
    setBulkyMessage(bulky?.message || "");
    setLoadingUpload(State.idle);
    setImageData(undefined);
    setImage(undefined);
    setError("");
  }

  function cancel() {
    modal.current?.dismiss();
    setBulkyTitle("");
    setBulkyMessage("");
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
    if (!bulky && !image) {
      setError("image-url");
      return;
    }

    try {
      await onSubmitBulky(bulkyTitle, bulkyMessage, image);

      refScrollRoot.current?.scrollTo({
        top: 0,
      });

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

    // https://pqina.nl/blog/convert-a-file-to-a-base64-string-with-javascript/#encoding-the-file-as-a-base-string
    function getDataUrl(file: File) {
      return new Promise<string>((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }

    (async () => {
      const image64 = await getDataUrl(file);
      setImageData(image64);
      setImage(file);
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

    // https://stackoverflow.com/a/38935990/19100899
    function dataURLtoFile(dataurl: string, filename: string) {
      const arr = dataurl.split(",");
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[arr.length - 1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }
    if (!photo.dataUrl) throw "Image not found";
    const f = dataURLtoFile(
      photo.dataUrl,
      photo.webPath?.replace(/^.*[\\\/]/, "") + "." + photo.format,
    );
    setImage(f);
    setImageData(photo.dataUrl);
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
              {bulky ? t("save") : t("create")}
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
            <div className="tw-w-full">
              <IonLabel className="tw-mt-2 tw-mb-0">{t("image")}</IonLabel>

              <div className="tw-text-center tw-w-full">
                {!(loadingUpload === State.loading) &&
                (imageData || bulky?.image_url) ? (
                  <IonCard
                    onClick={handleClickUpload}
                    className={`tw-my-8 tw-mx-[50px] tw-border tw-border-solid ${
                      loadingUpload ? "tw-border-medium" : "tw-border-primary"
                    }`}
                  >
                    <IonImg
                      src={imageData || bulky?.image_url}
                      alt={t("loading")}
                      className="tw-max-w-full"
                    />
                  </IonCard>
                ) : (
                  <div className="tw-w-full tw-h-[300px] tw-flex tw-justify-center tw-items-center">
                    <IonCard
                      onClick={handleClickUpload}
                      className={`tw-border tw-border-solid tw-w-[200px] tw-h-[200px] tw-flex tw-justify-center tw-items-center ${
                        loadingUpload === State.loading
                          ? "tw-border-medium"
                          : "tw-border-primary"
                      }`}
                    >
                      <div className="tw-relative">
                        <IonIcon size="large" icon={imageOutline} />
                        {loadingUpload === State.loading ? (
                          <IonIcon
                            icon={hourglassOutline}
                            size="small"
                            color="primary"
                            className="tw-bg-primary-contrast tw-p-[2px] tw-rounded-full tw-absolute -tw-bottom-1 -tw-right-3"
                          />
                        ) : null}
                      </div>
                    </IonCard>
                  </div>
                )}
              </div>

              <IonButton
                onClick={handleClickUpload}
                size="default"
                className="tw-m-0 tw-mb-4"
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
                  className="tw-mr-2"
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
        </IonList>
      </IonContent>
    </IonModal>
  );
}
