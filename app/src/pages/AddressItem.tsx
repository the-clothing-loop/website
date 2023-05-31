import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonPage,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { useContext, useMemo } from "react";
import { RouteComponentProps } from "react-router";
import UserCard from "../components/UserCard";
import { StoreContext } from "../Store";
import isPaused from "../utils/is_paused";

export default function AddressItem({
  match,
}: RouteComponentProps<{ uid: string }>) {
  const { chainUsers, chain } = useContext(StoreContext);
  const user = useMemo(() => {
    let userUID = match.params.uid;
    return chainUsers.find((u) => u.uid === userUID) || null;
  }, [match.params.uid, chainUsers]);
  const isChainAdmin = useMemo(() => {
    const userChain = user?.chains.find((uc) => uc.chain_uid === chain?.uid);
    return userChain?.is_chain_admin || false;
  }, [match.params.uid, user, chain]);

  const isUserPaused = isPaused(user?.paused_until || null);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/address">Back</IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user ? (
          <UserCard
            user={user}
            isUserAdmin={isChainAdmin}
            isUserPaused={isUserPaused}
          />
        ) : null}
      </IonContent>
    </IonPage>
  );
}
