import { useIonAlert } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { useTranslation } from "react-i18next";
import { StoreProvider } from "./stores/Store";
import Routes from "./Routes";
import { logout } from "./api/login";
import { Suspense, useEffect } from "react";
import dayjs from "./dayjs";
import Loading from "./components/PrivateRoute/Loading";

export default function App() {
  const [presentAlert] = useIonAlert();
  const { t, i18n } = useTranslation();
  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  function handleIsOffline(err: any) {
    presentAlert({
      header: "Unable to reach our servers",
      message:
        err?.message ||
        err?.data + "" ||
        err?.statusText ||
        "Unknown error occurred",
      buttons: [
        {
          text: t("logout"),
          role: "destructive",
          cssClass: "!tw-font-normal",
          handler: () => {
            logout()
              .catch((e) => {})
              .then(() => {
                globalThis.location.reload();
              });
          },
        },
        {
          text: t("tryAgain"),
          role: "confirm",
          cssClass: "tw-font-bold",
          handler: () => {
            globalThis.location.reload();
          },
        },
      ],
      // backdropDismiss: false,
    });
  }

  return (
    <StoreProvider onIsOffline={handleIsOffline}>
      <Suspense fallback={<Loading />}>
        <IonReactRouter>
          <Routes />
        </IonReactRouter>
      </Suspense>
    </StoreProvider>
  );
}
