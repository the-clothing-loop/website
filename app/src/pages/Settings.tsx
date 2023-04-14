import {
  IonAlert,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
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
  IonToolbar,
  SelectChangeEventDetail,
} from "@ionic/react";
import type { IonSelectCustomEvent } from "@ionic/core";
import { flag, shield, shieldOutline } from "ionicons/icons";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Chain, chainGet } from "../api";
import { StoreContext } from "../Store";
import UserCard from "../components/UserCard";
import { RouteComponentProps } from "react-router";

export default function Settings() {
  const { authUser, chain, isAuthenticated, logout, setChain } =
    useContext(StoreContext);
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
    Promise.all(authUser.chains.map((uc) => chainGet(uc.chain_uid))).then(
      (chains) => {
        setListOfChains(chains.map((c) => c.data));
      }
    );
    refChainSelect.current?.open();
  }, [authUser]);

  function handleChainSelect(
    e: IonSelectCustomEvent<SelectChangeEventDetail<any>>
  ) {
    const chainUID = e.detail.value;
    const c = listOfChains.find((c) => c.uid === chainUID) || null;

    console.log("set chain selected", c);

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
              header="Logout"
              message="Are you sure you want to logout?"
              buttons={[
                {
                  text: "Cancel",
                },
                {
                  text: "Logout",
                  handler: logout,
                },
              ]}
            ></IonAlert>
          </div>
        </IonContent>
      ) : null}
    </IonPage>
  );
}
