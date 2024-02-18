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
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from "@ionic/react";

import type { IonModalCustomEvent } from "@ionic/core";
import { RefObject, useContext, useEffect, useState } from "react";
import { StoreContext } from "../Store";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import { chainUpdate } from "../api";
import { refreshOutline } from "ionicons/icons";

export default function EditHeaders(props: {
  initalHeader: string | null;
  page: string;
  modal: RefObject<HTMLIonModalElement>;
  didDismiss?: (e: IonModalCustomEvent<OverlayEventDetail<any>>) => void;
}) {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const { chain } = useContext(StoreContext);

  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();

  const [header, setHeader] = useState(props.initalHeader);
  const [headers, setHeaders] = useState({});

  function modalInit() {
    setError("");
  }
  useEffect(() => {
    updateHeader();
  }, [headers]);

  function cancel() {
    props.modal.current?.dismiss();
  }

  function handleSave() {
    const page = props.page;
    const prevHeaders = chain?.headers_override
      ? JSON.parse(chain.headers_override)
      : "";

    setHeaders(() => ({
      ...prevHeaders,
      [page]: header,
    }));
  }

  async function updateHeader() {
    if (!chain?.uid) return;

    try {
      await chainUpdate({
        uid: chain.uid,
        headers_override: JSON.stringify(headers),
      });
      setError("");

      props.modal.current?.dismiss("", "confirm");
    } catch (err: any) {
      setError(err.status);
      toastError(present, err);
    }
  }

  function reset() {
    if (!chain?.uid) return;
    const handler = () => {
      chainUpdate({
        uid: chain.uid,
        headers_override: "",
      });
      props.modal.current?.dismiss();
    };

    presentAlert({
      header: t("resetHeaders"),
      subHeader: t("areYouSureYouWantToResetHeaders"),
      buttons: [
        {
          text: t("cancel"),
        },
        {
          role: "destructive",
          text: t("delete"),
          handler,
        },
      ],
    });
  }

  return (
    <IonModal
      ref={props.modal}
      onIonModalWillPresent={modalInit}
      onIonModalDidDismiss={props.didDismiss}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 0.75, 1]}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>{t("cancel")}</IonButton>
          </IonButtons>
          <IonTitle>{t("updateHeaders")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSave}
              color={!error ? "primary" : "danger"}
            >
              {t("save")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem
            lines="none"
            color={error === "number" ? "danger" : undefined}
          >
            <IonInput
              type="text"
              label={t("Title")}
              labelPlacement="start"
              max={50}
              spellCheck
              autoCapitalize="words"
              maxlength={50}
              counter
              placeholder={props.initalHeader || ""}
              onIonInput={(e) => setHeader(e.detail.value + "")}
            />
          </IonItem>
          <IonItem
            lines="none"
            color={error === "holder" ? "danger" : undefined}
          ></IonItem>
        </IonList>
        {chain?.headers_override ? (
          <IonItem lines="full" color="dark" key="reset">
            <IonIcon icon={refreshOutline} className="tw-ml-0.5 tw-mr-5" />
            <IonLabel className="ion-text-wrap">
              <h3>{t("resetHeaders")}</h3>
              <p>{t("resetHeadersDescription")}</p>
            </IonLabel>
            <IonButton slot="end" onClick={reset} color="danger">
              {t("reset")}
            </IonButton>
          </IonItem>
        ) : null}
      </IonContent>
    </IonModal>
  );
}
