import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  SelectChangeEventDetail,
  useIonToast,
} from "@ionic/react";
import type { IonSelectCustomEvent } from "@ionic/core";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Chain, chainGet } from "../api";
import { StoreContext } from "../Store";
import UserCard from "../components/UserCard";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";

const VERSION = import.meta.env.VITE_APP_VERSION;

export default function Settings() {
  const { t } = useTranslation();
  const { authUser, chain, isAuthenticated, logout, setChain } =
    useContext(StoreContext);
  const [present] = useIonToast();
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
            <UserCard user={authUser} isUserAdmin={isUserAdmin} />
          ) : null}
          <IonList style={{ marginBottom: "4em" }}>
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
              header={t("Logout")!}
              message={t("Are you sure you want to logout?")!}
              buttons={[
                {
                  text: t("Cancel"),
                },
                {
                  text: t("Logout"),
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
              <IonLabel color="medium">{t("Privacy Policy")}</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      ) : null}
    </IonPage>
  );
}
