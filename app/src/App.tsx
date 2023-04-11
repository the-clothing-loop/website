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
} from "@ionic/react";
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
import "./theme/overrides.css";
import { StoreContext } from "./Store";
import { Suspense, useContext, useEffect } from "react";

import HelpList from "./pages/HelpList";
import HelpItem from "./pages/HelpItem";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import AddressList from "./pages/AddressList";
import AddressItem from "./pages/AddressItem";

setupIonicReact({
  mode: "ios",
});

export default function App() {
  const { isAuthenticated, init, authenticate } = useContext(StoreContext);

  useEffect(() => {
    init().then(() => {
      authenticate().catch((err) => console.warn(err));
    });
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Redirect exact path="/" to="/help" />
            <Route exact path="/help" component={HelpList}></Route>
            <Route path="/help/:index" component={HelpItem}></Route>
            <Route exact path="/address" component={AddressList}></Route>
            <Route path="/address/:uid" component={AddressItem}></Route>
            <Route exact path="/settings" component={Settings}></Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="help" href="/help">
              <IonIcon aria-hidden="true" icon={bookOutline} />
              <IonLabel>Info</IonLabel>
            </IonTabButton>
            <IonTabButton tab="address" href="/address">
              <IonIcon aria-hidden="true" icon={homeOutline} />
              <IonLabel>Addresses</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon aria-hidden="true" icon={bagHandleOutline} />
              <IonLabel>Bags</IonLabel>
            </IonTabButton>

            <IonTabButton tab="tab4" href="/tab3">
              <IonIcon aria-hidden="true" icon={cubeOutline} />
              <IonLabel>Bulky Items</IonLabel>
            </IonTabButton>

            <IonTabButton tab="settings" href="/settings">
              <IonIcon aria-hidden="true" icon={cogOutline} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
        {isAuthenticated !== null ? (
          <Login isLoggedIn={isAuthenticated} />
        ) : null}
      </IonReactRouter>
    </IonApp>
  );
}
