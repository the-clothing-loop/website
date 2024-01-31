import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./Store";
import App from "./App";
import "./i18n";
import { IonReactRouter } from "@ionic/react-router";
import { useIonAlert } from "@ionic/react";
import { useTranslation } from "react-i18next";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <Main />
  </StrictMode>,
);

function Main() {
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
          handler() {
            window.location.reload();
          },
        },
      ],
      backdropDismiss: false,
    });
  }

  return (
    <StoreProvider onIsOffline={handleIsOffline}>
      <IonReactRouter>
        <App />
      </IonReactRouter>
    </StoreProvider>
  );
}
