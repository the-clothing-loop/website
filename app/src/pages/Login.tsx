import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonText,
} from "@ionic/react";
import {
  arrowForwardOutline,
  mailUnreadOutline,
  sendOutline,
} from "ionicons/icons";
import { Fragment, useContext, useRef, useState } from "react";
import { useHistory } from "react-router";
import { loginEmail } from "../api";
import { StoreContext } from "../Store";

enum State {
  idle,
  error,
  success,
}

export default function Login(props: { isLoggedIn: boolean }) {
  const { login } = useContext(StoreContext);
  const history = useHistory();

  const modal = useRef<HTMLIonModalElement>(null);
  const inputEmail = useRef<HTMLIonInputElement>(null);
  const inputToken = useRef<HTMLIonInputElement>(null);

  const [showToken, setShowToken] = useState(false);
  const [sentState, setSentState] = useState(State.idle);
  const [verifyState, setVerifyState] = useState(State.idle);
  const [sentTimeout, setSentTimeout] = useState<number>();

  async function handleSendEmail() {
    clearTimeout(sentTimeout);
    const email = inputEmail.current?.value || "";
    if (!email) return;
    try {
      const res = await loginEmail(email + "");
      setShowToken(true);
      setSentState(State.success);
      setSentTimeout(
        setTimeout(() => setSentState(State.idle), 1000 * 60 /* 1 min */) as any
      );
    } catch (e) {
      setSentState(State.error);
      console.error(e);
    }
  }

  async function handleVerifyToken() {
    const token = inputToken.current?.value || "";
    if (!token) return;

    try {
      await login(token + "");
      setVerifyState(State.success);
      modal.current?.dismiss("success");
      history.replace("/settings", "select-loop");
    } catch (e: any) {
      console.error(e);
      setVerifyState(State.error);
    }
  }

  return (
    <IonModal
      ref={modal}
      isOpen={!props.isLoggedIn}
      canDismiss={async (d) => d === "success"}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem lines="none">
          <IonText>
            Please enter your email address, a one time password will be sent to
            you.
          </IonText>
        </IonItem>
        <IonItem lines="none">
          <IonInput
            label="Email"
            labelPlacement="fixed"
            ref={inputEmail}
            type="email"
            autocomplete="on"
            autoSave="on"
            autofocus
            aria-autocomplete="list"
            required
            placeholder="Your email address"
          />
        </IonItem>
        <IonItem lines="none">
          <IonButton
            size="default"
            slot="end"
            expand="block"
            color={
              sentState === State.error
                ? "danger"
                : sentState === State.success
                ? "success"
                : "primary"
            }
            disabled={sentState === State.success}
            onClick={handleSendEmail}
          >
            <IonLabel>Send</IonLabel>
            {sentState === State.success ? (
              <IonIcon slot="end" icon={mailUnreadOutline} />
            ) : (
              <IonIcon slot="end" icon={sendOutline} />
            )}
          </IonButton>
        </IonItem>
        {showToken ? (
          <Fragment key="token">
            <IonItem lines="none">
              <IonText>Enter the Passcode you received in your email</IonText>
            </IonItem>
            <IonItem lines="none">
              <IonInput
                type="text"
                ref={inputToken}
                autoCorrect="off"
                placeholder="••••••"
                label="Passcode"
                labelPlacement="fixed"
              />
            </IonItem>
            <IonItem lines="none">
              <IonButton
                color={
                  verifyState === State.error
                    ? "danger"
                    : verifyState === State.success
                    ? "success"
                    : "primary"
                }
                size="default"
                disabled={verifyState === State.success}
                slot="end"
                expand="block"
                onClick={handleVerifyToken}
              >
                <IonLabel>Login</IonLabel>
                <IonIcon slot="end" icon={arrowForwardOutline} />
              </IonButton>
            </IonItem>
          </Fragment>
        ) : null}
      </IonContent>
    </IonModal>
  );
}
