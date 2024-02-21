import { useIonAlert } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { useTranslation } from "react-i18next";
import { StoreProvider } from "./Store";
import Routes from "./Routes";
import { logout } from "./api";

export default function App() {
  const [presentAlert] = useIonAlert();
  const { t } = useTranslation();

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
          text: "Try Again",
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
      <IonReactRouter>
        <Routes />
      </IonReactRouter>
    </StoreProvider>
  );
}
