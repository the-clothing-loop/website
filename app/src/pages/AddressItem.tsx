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
  IonTextarea,
  IonIcon,
} from "@ionic/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router";
import UserCard from "../components/UserCard";
import { StoreContext } from "../stores/Store";
import IsPaused from "../utils/is_paused";
import { t } from "i18next";
import Badges from "../components/SizeBadge";
import AddressBagCard from "../components/Bags/AddressBagCard";
import { chainChangeUserNote, chainGetUserNote } from "../api/chain";
import { useDebounce } from "@uidotdev/usehooks";
import { checkmarkCircle } from "ionicons/icons";

export default function AddressItem({
  match,
}: RouteComponentProps<{ uid: string }>) {
  const { chainUsers, chain, isChainAdmin, bags, authUser } =
    useContext(StoreContext);
  const user = useMemo(() => {
    let userUID = match.params.uid;
    return chainUsers.find((u) => u.uid === userUID) || null;
  }, [match.params.uid, chainUsers]);
  const isUserPaused = IsPaused(user, chain?.uid);

  const userBags = useMemo(() => {
    return bags.filter((b) => b.user_uid === user?.uid);
  }, [bags, authUser]);

  const isNoteEditable =
    isChainAdmin || authUser?.uid === user?.uid || authUser?.is_root_admin;
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!chain || !user) return;
    chainGetUserNote(chain.uid, user.uid).then(setNote);
  }, [user]);
  const slowNote = useDebounce(note, 1300);
  useEffect(() => {
    if (!chain || !user || !isNoteEditable) return;
    chainChangeUserNote(chain.uid, user.uid, note);
  }, [slowNote]);

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
        <IonItem lines="none">
          <div className="tw-w-full tw-mt-2 tw-mb-4">
            <IonLabel className="!tw-font-bold">{t("notes")}</IonLabel>
            <div className="tw-relative tw-border tw-border-green tw-bg-green-contrast dark:tw-bg-background">
              <IonTextarea
                className="tw-px-2 !tw-min-h-[200px]"
                value={note}
                readonly={!isNoteEditable}
                onIonInput={(e) => setNote(e.detail.value as string)}
                autoGrow
                autocapitalize="sentences"
              />
              <div className="tw-absolute tw-bottom-0 tw-right-0">
                {note === slowNote && isNoteEditable ? (
                  <IonIcon
                    className="tw-block tw-m-1"
                    size="small"
                    icon={checkmarkCircle}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </IonItem>
      </IonContent>
    </IonPage>
  );
}
