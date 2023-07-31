import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonText,
  useIonToast,
  IonPage,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import {
  arrowBack,
  arrowForwardOutline,
  mailUnreadOutline,
  sendOutline,
} from "ionicons/icons";
import { Keyboard } from "@capacitor/keyboard";
import { Fragment, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import toastError from "../../toastError";
import { loginEmail } from "../api";
import { StoreContext } from "../Store";

enum State {
  idle,
  error,
  success,
  loading,
}

const KEYCODE_ENTER = 13;

export default function Login(props: { isLoggedIn: boolean }) {
  const { t } = useTranslation();
  const { login } = useContext(StoreContext);
  const history = useHistory();
  const [present] = useIonToast();

  const modal = useRef<HTMLIonModalElement>(null);
  const inputEmail = useRef<HTMLIonInputElement>(null);
  const inputToken = useRef<HTMLIonInputElement>(null);

  const [showToken, setShowToken] = useState(false);
  const [sentState, setSentState] = useState(State.idle);
  const [verifyState, setVerifyState] = useState(State.idle);
  const [sentTimeout, setSentTimeout] = useState<number>();

  function handleSendEmail() {
    if (sentState === State.success || sentState === State.loading) return;
    clearTimeout(sentTimeout);
    const email = inputEmail.current?.value + "";
    if (!email) return;
    setSentState(State.loading);

    (async () => {
      try {
        await loginEmail(email + "");
        setShowToken(true);
        setSentState(State.success);
        setSentTimeout(
          setTimeout(
            () => setSentState(State.idle),
            1000 * 60 /* 1 min */,
          ) as any,
        );
        Keyboard.hide();
      } catch (err) {
        setSentState(State.error);
        toastError(present, err);
        console.error(err);
      }
    })();
  }

  function handleInputEmailEnter(e: any) {
    if (e?.keyCode === KEYCODE_ENTER) {
      handleSendEmail();
    }
  }

  function handleInputTokenEnter(e: any) {
    if (e?.keyCode === KEYCODE_ENTER) {
      handleVerifyToken();
    }
  }

  function handleVerifyToken() {
    if (verifyState === State.loading) return;
    const token = inputToken.current?.value || "";
    if (!token) return;
    setVerifyState(State.loading);

    (async () => {
      try {
        await login(token + "");
        setVerifyState(State.success);
        modal.current?.dismiss("success");
        history.replace("/settings", "select-loop");
      } catch (e: any) {
        console.error(e);
        setVerifyState(State.error);
      }
    })();
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("login")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <IonHeader collapse="condense" className="ion-margin-bottom">
          <IonToolbar>
            <IonTitle size="large">{t("login")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem lines="none">
          <IonText>{t("pleaseEnterYourEmailAddress")}</IonText>
        </IonItem>
        <IonItem lines="none">
          <IonInput
            label={t("email")!}
            labelPlacement="fixed"
            ref={inputEmail}
            type="email"
            autocomplete="email"
            autoSave="on"
            autofocus
            enterkeyhint="send"
            onKeyUp={handleInputEmailEnter}
            aria-autocomplete="list"
            required
            placeholder={t("yourEmailAddress")!}
          />
        </IonItem>
        <IonItem lines="none">
          <IonButton
            size="default"
            slot="end"
            shape="round"
            expand="block"
            color={
              sentState === State.idle
                ? "primary"
                : sentState === State.success
                ? "success"
                : sentState === State.loading
                ? "medium"
                : "danger"
            }
            disabled={sentState === State.success}
            onClick={handleSendEmail}
          >
            {sentState === State.loading ? t("loading") : t("send")}
            {sentState === State.success ? (
              <IonIcon slot="end" icon={mailUnreadOutline} />
            ) : sentState === State.loading ? null : (
              <IonIcon slot="end" icon={sendOutline} />
            )}
          </IonButton>
        </IonItem>
        {showToken ? (
          <Fragment key="token">
            <IonItem lines="none" className="ion-margin-top">
              <IonText>{t("enterThePasscodeYouReceivedInYourEmail")}</IonText>
            </IonItem>
            <IonItem lines="none">
              <IonInput
                type="number"
                ref={inputToken}
                autoCorrect="off"
                placeholder="••••••"
                label={t("passcode")!}
                enterkeyhint="enter"
                onKeyUp={handleInputTokenEnter}
                labelPlacement="fixed"
              />
            </IonItem>
            <IonItem lines="none">
              <IonButton
                shape="round"
                color={
                  verifyState === State.idle
                    ? "primary"
                    : verifyState === State.success
                    ? "success"
                    : verifyState === State.loading
                    ? "medium"
                    : "danger"
                }
                size="default"
                disabled={verifyState === State.success}
                slot="end"
                expand="block"
                onClick={handleVerifyToken}
              >
                {verifyState === State.loading ? (
                  <IonLabel>{t("loading")}</IonLabel>
                ) : (
                  <IonLabel>{t("login")}</IonLabel>
                )}
                {verifyState === State.loading ? null : (
                  <IonIcon slot="end" icon={arrowForwardOutline} />
                )}
              </IonButton>
            </IonItem>
          </Fragment>
        ) : null}
        <IonFab vertical="bottom" horizontal="start">
          <IonFabButton
            color="clear"
            onClick={() => history.goBack()}
            className="ion-margin-bottom"
          >
            <IonIcon icon={arrowBack}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}
