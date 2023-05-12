import {
  IonActionSheet,
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  SelectChangeEventDetail,
  useIonActionSheet,
  useIonToast,
} from "@ionic/react";
import type { IonSelectCustomEvent } from "@ionic/core";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Chain, chainGet } from "../api";
import { StoreContext } from "../Store";
import UserCard from "../components/UserCard";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import { pause, pauseCircle, stopCircle } from "ionicons/icons";
import dayjs from "../dayjs";
import isPaused from "../utils/is_paused";

const VERSION = import.meta.env.VITE_APP_VERSION;

export default function Settings() {
  const { t } = useTranslation();
  const { authUser, chain, isAuthenticated, setPause, logout, setChain } =
    useContext(StoreContext);
  const [present] = useIonToast();
  const [presentActionSheet] = useIonActionSheet();
  const refChainSelect = useRef<HTMLIonSelectElement>(null);

  const isUserAdmin = useMemo(
    () =>
      authUser && chain
        ? authUser?.chains.find((uc) => uc.chain_uid === chain.uid)
            ?.is_chain_admin || false
        : false,
    [authUser, chain]
  );

  const [listOfChains, setListOfChains] = useState<Chain[]>([]);
  useEffect(() => {
    if (!authUser) {
      setListOfChains([]);
      return;
    }

    Promise.all(authUser.chains.map((uc) => chainGet(uc.chain_uid)))
      .then((chains) => {
        setListOfChains(chains.map((c) => c.data));
      })
      .catch((err) => {
        toastError(present, err);
      });
    if (!chain) {
      refChainSelect.current?.open();
    }
  }, [authUser]);

  function handleChainSelect(
    e: IonSelectCustomEvent<SelectChangeEventDetail<any>>
  ) {
    const chainUID = e.detail.value;
    const c = listOfChains.find((c) => c.uid === chainUID) || null;

    setChain(c, authUser!.uid);
  }

  function handlePauseButton(isUserPaused: boolean) {
    if (isUserPaused) {
      setPause("none");
    } else {
      presentActionSheet({
        header: t("pauseUntil"),
        buttons: [
          {
            text: t("week", { count: 1 }),
            handler: () => setPause("week"),
          },
          {
            text: t("week", { count: 2 }),
            handler: () => setPause("2weeks"),
          },
          {
            text: t("week", { count: 3 }),
            handler: () => setPause("3weeks"),
          },
          {
            text: t("cancel"),
            role: "cancel",
          },
        ],
      });
    }
  }

  let isUserPaused = isPaused(authUser?.paused_until || null);

  let pausedDayjs = isUserPaused && dayjs(authUser!.paused_until);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      {isAuthenticated === true ? (
        <IonContent>
          {authUser ? (
            <UserCard
              user={authUser}
              isUserPaused={isUserPaused}
              isUserAdmin={isUserAdmin}
            />
          ) : null}
          <IonList style={{ marginBottom: "4em" }}>
            <IonItem lines="none">
              <IonLabel>
                <h3>{t("pauseUserActivity")}</h3>
                <p>
                  {pausedDayjs
                    ? pausedDayjs.fromNow()
                    : t("setTimerForACoupleOfWeeks")}
                </p>
              </IonLabel>
              <IonButton
                slot="end"
                color="primary"
                onClick={() => handlePauseButton(isUserPaused)}
              >
                {isUserPaused ? (
                  <>
                    <span>{t("unPause")}</span>
                    <IonIcon icon={stopCircle} style={{ marginLeft: 8 }} />
                  </>
                ) : (
                  <>
                    <span>{t("pauseUntil")}</span>
                    <IonIcon icon={pauseCircle} style={{ marginLeft: 8 }} />
                  </>
                )}
              </IonButton>
            </IonItem>
            <IonItem lines="none">
              <IonSelect
                ref={refChainSelect}
                label={chain ? "Selected Loop" : "Select a Loop"}
                labelPlacement="stacked"
                value={chain?.uid || ""}
                onIonChange={handleChainSelect}
                interface="action-sheet"
              >
                {listOfChains.map((c) => {
                  return (
                    <IonSelectOption value={c.uid} key={c.uid}>
                      {c.name}
                    </IonSelectOption>
                  );
                })}
              </IonSelect>
            </IonItem>
          </IonList>

          <div className="ion-padding">
            <IonButton id="settings-logout-btn" expand="block" color="danger">
              Logout
            </IonButton>
            <IonAlert
              trigger="settings-logout-btn"
              header={t("logout")!}
              message={t("areYouSureYouWantToLogout?")!}
              buttons={[
                {
                  text: t("cancel"),
                },
                {
                  text: t("logout"),
                  handler: logout,
                },
              ]}
            ></IonAlert>
          </div>
          <IonText
            className="ion-text-center"
            style={{
              display: "block",
              color: "var(--ion-color-medium)",
              fontSize: "14px",
            }}
          >
            version: {VERSION}
          </IonText>
          <IonList className="ion-margin-top">
            <IonItem lines="full" routerLink="/privacy-policy">
              <IonLabel color="medium">{t("privacyPolicy")}</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      ) : null}
    </IonPage>
  );
}
