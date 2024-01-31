import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./Store";
import App from "./App";
import "./i18n";
import { IonReactRouter } from "@ionic/react-router";
import { useIonAlert } from "@ionic/react";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <Main />
  </StrictMode>,
);

function Main() {
  const [presentAlert] = useIonAlert();
  return (
    <StoreProvider presentAlert={presentAlert}>
      <IonReactRouter>
        <App />
      </IonReactRouter>
    </StoreProvider>
  );
}
