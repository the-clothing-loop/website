import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonPage,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useContext, useMemo } from "react";
import { RouteComponentProps } from "react-router";
import UserCard from "../components/UserCard";
import { StoreContext } from "../Store";
import isPaused from "../utils/is_paused";
import { t } from "i18next";
import Badges from "../components/SizeBadge";

export default function AddressItem({
  match,
}: RouteComponentProps<{ uid: string }>) {
  const { chainUsers, chain, isChainAdmin } = useContext(StoreContext);
  const user = useMemo(() => {
    let userUID = match.params.uid;
    return chainUsers.find((u) => u.uid === userUID) || null;
  }, [match.params.uid, chainUsers]);
  const isUserPaused = isPaused(user?.paused_until || null);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/address">{t("back")}</IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user ? (
          <UserCard
            user={user}
            chain={chain}
            isUserPaused={isUserPaused}
            showMessengers
          />
        ) : null}

        {isChainAdmin ? (
          <IonItem lines="none" className="ion-align-items-start">
            <IonLabel className="ion-text-bold">
              {t("interestedSizes")}
            </IonLabel>
            <div className="ion-margin-top ion-margin-bottom" slot="end">
              {chain ? (
                <Badges genders={chain.genders} sizes={chain.sizes} />
              ) : null}
            </div>
          </IonItem>
        ) : null}
      </IonContent>
    </IonPage>
  );
}
