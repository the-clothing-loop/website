import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonPage,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useContext, useMemo } from "react";
import { RouteComponentProps } from "react-router";
import UserCard from "../components/UserCard";
import { StoreContext } from "../stores/Store";
import isPaused from "../utils/is_paused";
import { t } from "i18next";
import Badges from "../components/SizeBadge";
import AddressBagCard from "../components/Bags/AddressBagCard";

export default function AddressItem({
  match,
}: RouteComponentProps<{ uid: string }>) {
  const { chainUsers, chain, isChainAdmin, bags, authUser } =
    useContext(StoreContext);
  const user = useMemo(() => {
    let userUID = match.params.uid;
    return chainUsers.find((u) => u.uid === userUID) || null;
  }, [match.params.uid, chainUsers]);
  const isUserPaused = isPaused(user?.paused_until || null);

  const userBags = useMemo(() => {
    return bags.filter((b) => b.user_uid === user?.uid);
  }, [bags, authUser]);

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
            <IonLabel className="!tw-font-bold">
              {t("interestedSizes")}
            </IonLabel>
            <div className="ion-margin-top ion-margin-bottom" slot="end">
              {user ? <Badges genders={[]} sizes={user.sizes} /> : null}
            </div>
          </IonItem>
        ) : null}
        <IonGrid>
          <IonRow>
            {userBags.map((bag) => {
              return (
                <IonCol size="6" key={"inRoute" + bag.id}>
                  <AddressBagCard
                    authUser={authUser}
                    isChainAdmin={isChainAdmin}
                    bag={bag}
                  />
                </IonCol>
              );
            })}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}
