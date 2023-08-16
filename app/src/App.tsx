import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  getPlatforms,
  setupIonicReact,
} from "@ionic/react";
import { SplashScreen } from "@capacitor/splash-screen";
import {
  bookOutline,
  homeOutline,
  bagHandleOutline,
  cubeOutline,
  peopleCircleOutline,
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
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import HelpList from "./pages/HelpList";
import HelpItem from "./pages/HelpItem";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import AddressList from "./pages/AddressList";
import AddressItem from "./pages/AddressItem";
import Loading from "./pages/Loading";
import BagsList from "./pages/BagsList";
import BulkyList from "./pages/BulkyList";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { OnboardingPageOne, OnboardingPageTwo } from "./pages/Onboarding";

import { useTranslation } from "react-i18next";
import dayjs from "./dayjs";
import { OneSignalInitCap } from "./onesignal";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import OpenSource from "./pages/OpenSource";
import { useThrottledCallback } from "use-debounce";

SplashScreen.show({
  autoHide: false,
});

setupIonicReact({
  mode: "ios",
});

export default function App() {
  const { isAuthenticated, init, authenticate, bags, chain } =
    useContext(StoreContext);
  const history = useHistory();
  let location = useLocation();

  useEffect(() => {
    (async () => {
      const platforms = getPlatforms();
      if (platforms.includes("capacitor")) {
        await OneSignalInitCap().catch((err) => {
          console.error(err);
        });
      }
      await auth();
    })();

    const root = document.getElementById("#root");
    root?.addEventListener("store-error", eventCatchStoreErr);

    return () => {
      root?.removeEventListener("store-error", eventCatchStoreErr);
    };
  }, []);

  useEffect(() => {
    if (!chain || chain.theme === undefined) return;
    const bodyEl = document.getElementsByTagName("body")[0];

    let theme = chain.theme;
    if (theme === "default" || !theme) theme = "grey";

    bodyEl.setAttribute("data-theme", theme);
  }, [chain?.theme]);

  async function auth() {
    let success = false;
    try {
      await init();
      await authenticate();
      success = true;
    } catch (err) {
      console.warn(err);
    }
    SplashScreen.hide();

    if (success) history.replace("/help");
    else history.replace("/onboarding");
  }

  const hasOldBag = useMemo(() => {
    if (!bags.length) return false;

    return bags.some((b) => {
      const updatedAt = dayjs(b.updated_at);
      const now = dayjs();
      return updatedAt.isBefore(now.add(-7, "days"));
    });
  }, [bags]);

  return (
    <IonApp>
      <Switch location={location}>
        <Route path="/onboarding" component={OnboardingRoute} />
        <PrivateRoute isAuthenticated={isAuthenticated}>
          <AppRoute hasOldBag={hasOldBag} />
        </PrivateRoute>
      </Switch>
    </IonApp>
  );
}

function eventCatchStoreErr(e: any) {
  console.log(e);
}

function PrivateRoute({
  children,
  isAuthenticated,
  ...rest
}: PropsWithChildren<{ isAuthenticated: boolean | null }>) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated === null ? (
          <Loading />
        ) : isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/onboarding",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

function OnboardingRoute() {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition classNames="fade" timeout={400} key={location.key}>
        <Switch location={location}>
          <Redirect exact from="/onboarding" to="/onboarding/1" />
          <Route exact path="/onboarding/1" component={OnboardingPageOne} />
          <Route exact path="/onboarding/2" component={OnboardingPageTwo} />
          <Route exact path="/onboarding/3" component={Login} />
        </Switch>
      </CSSTransition>
    </TransitionGroup>
  );
}

function AppRoute({ hasOldBag }: { hasOldBag: boolean }) {
  const { t } = useTranslation();
  const { refresh } = useContext(StoreContext);
  const [firstStart, setFirstStart] = useState(false);
  const changeTabs = useThrottledCallback((tab: string) => {
    if (firstStart) {
      refresh(tab);
    }
  }, 2e5);
  useEffect(() => {
    setFirstStart(true);
  }, []);

  function handleTabsWillChange(e: CustomEvent<{ tab: string }>) {
    const tab = e.detail.tab;
    changeTabs(tab);
  }

  return (
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
          path="/settings/privacy-policy"
          component={PrivacyPolicy}
        ></Route>
        <Route
          exact
          path="/settings/open-source"
          component={OpenSource}
        ></Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom" onIonTabsWillChange={handleTabsWillChange}>
        <IonTabButton tab="help" href="/help">
          <IonIcon aria-hidden="true" icon={bookOutline} />
          <IonLabel>{t("rules")}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="address" href="/address">
          <IonIcon aria-hidden="true" icon={homeOutline} />
          <IonLabel>{t("route")}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="bags" href="/bags">
          <IonIcon aria-hidden="true" icon={bagHandleOutline} />
          {hasOldBag ? (
            <div className="tw-bg-danger tw-rounded-full tw-w-2.5 tw-h-2.5 tw-absolute tw-top-[3px] tw-left-[calc(50%+10px)]"></div>
          ) : null}
          <IonLabel>{t("bags")}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="bulky-items" href="/bulky-items">
          <IonIcon aria-hidden="true" icon={cubeOutline} />
          <IonLabel>{t("bulkyItems")}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="settings" href="/settings">
          <IonIcon aria-hidden="true" icon={peopleCircleOutline} />
          <IonLabel>{t("info")}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}

interface CssVars {
  light: string;
  lightShade: string;
  lightTint: string;
  medium: string;
  mediumShade: string;
  mediumTint: string;
}
const THEME_TO_CSS_VARS = {
  grey: { "": "", color: "#a5a5a5" },
  leafGreen: { "": "", color: "#a6c665" },
  green: { "": "", color: "#66926e" },
  yellow: { "": "", color: "#f4b63f" },
  orange: { "": "", color: "#ef953d" },
  redLight: { "": "", color: "#e39aa1" },
  red: { "": "", color: "#c73643" },
  pinkLight: { "": "", color: "#ecbbd0" },
  pink: { "": "", color: "#dc77a3" },
  lilacLight: { "": "", color: "#dab5d6" },
  lilac: { "": "", color: "#b76dac" },
  purple: { "": "", color: "#a899c2" },
  skyBlue: { "": "", color: "#7ecfe0" },
  blueLight: { "": "", color: "#89b3d9" },
  blue: { "": "", color: "#1467b3" },
};
