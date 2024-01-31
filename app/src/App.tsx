import { useIonAlert } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { useTranslation } from "react-i18next";
import { StoreProvider } from "./Store";
import Routes from "./Routes";

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
          text: "Try Again",
          role: "confirm",
          handler: () => {
            // window.alert("Try Again clicked!")
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
