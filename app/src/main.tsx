import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./Store";
import App from "./App";
import "./i18n";
import { IonReactRouter } from "@ionic/react-router";
import { IonApp } from "@ionic/react";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <StoreProvider>
      <IonReactRouter>
        <App />
      </IonReactRouter>
    </StoreProvider>
  </StrictMode>
);
