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
  isPlatform,
  IonImg,
} from "@ionic/react";
import {
  arrowBack,
  arrowForwardOutline,
  mailUnreadOutline,
  sendOutline,
} from "ionicons/icons";
import { Keyboard } from "@capacitor/keyboard";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import toastError from "../../toastError";
import { loginEmail } from "../api";
import { StoreContext } from "../Store";
import { AppLauncher } from "@capacitor/app-launcher";

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

  const [isCapacitor] = useState(() => isPlatform("capacitor"));
  const [showToken, setShowToken] = useState(false);
  const [sentState, setSentState] = useState(State.idle);
  const [verifyState, setVerifyState] = useState(State.idle);
  const [sentTimeout, setSentTimeout] = useState<number>();
  const [tokenOverride, setTokenOverride] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const logoWhite = "./public/v2_logo_white.png";
  const logoBlack = "./public/v2_logo_black.png";

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(prefersDark.matches);
    prefersDark.addEventListener("change", (mediaQuery) =>
      setDarkMode(mediaQuery.matches),
    );
  }, []);

  function handleSendEmail() {
    if (sentState === State.success || sentState === State.loading) return;
    clearTimeout(sentTimeout);
    const email = inputEmail.current?.value + "";
    if (!email) return;
    setSentState(State.loading);

    (async () => {
      try {
        const res = await loginEmail(email + "");
        if (res.data && (res.data + "").length) {
          setTokenOverride(res.data + "");
        }
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
    let token = inputToken.current?.value || "";
    if (!token) return;
    setVerifyState(State.loading);

    if (token === "12345678" && tokenOverride !== "") {
      token = tokenOverride;
    }

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

  function openMailApp() {
    if (isPlatform("ios")) {
      window.location.href = "com.apple.mobilemail://";
    } else if (isPlatform("android")) {
      AppLauncher.openUrl({ url: "com.google.android.gm" });
    }
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
          <IonImg
            src={darkMode ? logoWhite : logoBlack}
            className="tw-w-full tw-px-8 tw-h-auto tw-mx-auto tw-mpt-4 tw-mb-20"
          />
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
        <IonItem
          lines="none"
          className="tw-text-right tw-mt-4 tw-bg-transparent"
        >
          {isCapacitor && showToken ? (
            <IonButton
              key="open-mail-app"
              size="default"
              slot="end"
              shape="round"
              color="light"
              className="tw-me-4"
              onClick={openMailApp}
            >
              {t("openMailApp")}
            </IonButton>
          ) : null}
          <IonButton
            size="default"
            slot="end"
            shape="round"
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
                {verifyState === State.loading ? t("loading") : t("login")}
                {verifyState === State.loading ? null : (
                  <IonIcon slot="end" icon={arrowForwardOutline} />
                )}
              </IonButton>
            </IonItem>
          </Fragment>
        ) : null}
        <div className="tw-bg-primary-shade dark:tw-bg-primary tw-fixed tw-bottom-0 tw-h-1/3 tw-w-full -tw-z-10 -tw-ml-4" />
        <div className="relative">
          <IonIcon
            aria-hidden="true"
            icon="/public/v2_o_pattern_green.svg"
            style={{ fontSize: 400 }}
            className="tw-absolute tw-left-20 -tw-bottom-[160px] -tw-z-10 tw-text-[#bfd6d3] dark:tw-text-primary-shade"
          />
        </div>
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
