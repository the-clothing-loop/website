import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  useIonToast,
} from "@ionic/react";
import { SplashScreen } from "@capacitor/splash-screen";
import { IonReactRouter } from "@ionic/react-router";
import {
  bookOutline,
  homeOutline,
  bagHandleOutline,
  cubeOutline,
  cogOutline,
} from "ionicons/icons";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/utilities.css";
import "./theme/overrides.css";
import { StoreContext } from "./Store";
import { useContext, useEffect, useState } from "react";

import HelpList from "./pages/HelpList";
import HelpItem from "./pages/HelpItem";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import AddressList from "./pages/AddressList";
import AddressItem from "./pages/AddressItem";
import Loading from "./pages/Loading";
import ToDo from "./pages/ToDo";
import BagsList from "./pages/BagsList";
import BulkyList from "./pages/BulkyList";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { useTranslation } from "react-i18next";

SplashScreen.show({
  autoHide: false,
});

setupIonicReact({
  mode: "ios",
});

export default function App() {
  const { isAuthenticated, init, authenticate } = useContext(StoreContext);
  const [present] = useIonToast();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    init()
      .then(() => authenticate().catch((err) => console.warn(err)))
      .finally(() => {
        setLoading(false);
        SplashScreen.hide();
      });

    const root = document.getElementById("#root");
    root?.addEventListener("store-error", eventCatchStoreErr);

    return () => {
      root?.removeEventListener("store-error", eventCatchStoreErr);
    };
  }, []);

  return (
    <IonApp>
      {loading ? (
        <Loading />
      ) : (
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Redirect exact path="/" to="/help" />
              <Route exact path="/help" component={HelpList}></Route>
              <Route path="/help/:index" component={HelpItem}></Route>
              <Route exact path="/address" component={AddressList}></Route>
              <Route path="/address/:uid" component={AddressItem}></Route>
              <Route exact path="/bags" component={BagsList}></Route>
              <Route exact path="/bulky-items" component={BulkyList}></Route>
              <Route exact path="/settings" component={Settings}></Route>
              <Route
                exact
                path="/privacy-policy"
                component={PrivacyPolicy}
              ></Route>
              <Route exact path="/todo" component={ToDo}></Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="help" href="/help">
                <IonIcon aria-hidden="true" icon={bookOutline} />
                <IonLabel>{t("Info")}</IonLabel>
              </IonTabButton>
              <IonTabButton tab="address" href="/address">
                <IonIcon aria-hidden="true" icon={homeOutline} />
                <IonLabel>{t("Addresses")}</IonLabel>
              </IonTabButton>
              <IonTabButton tab="bags" href="/bags">
                <IonIcon aria-hidden="true" icon={bagHandleOutline} />
                <IonLabel>{t("Bags")}</IonLabel>
              </IonTabButton>

              <IonTabButton tab="bulky-items" href="/bulky-items">
                <IonIcon aria-hidden="true" icon={cubeOutline} />
                <IonLabel>{t("Bulky Items")}</IonLabel>
              </IonTabButton>

              <IonTabButton tab="settings" href="/settings">
                <IonIcon aria-hidden="true" icon={cogOutline} />
                <IonLabel>{t("Settings")}</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
          {isAuthenticated !== null ? (
            <Login isLoggedIn={isAuthenticated} />
          ) : null}
        </IonReactRouter>
      )}
    </IonApp>
  );
}

function eventCatchStoreErr(e: any) {
  console.log(e);
}
