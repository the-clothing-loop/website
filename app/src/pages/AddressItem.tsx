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
  IonToggle,
} from "@ionic/react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import UserCard from "../components/UserCard";
import { StoreContext } from "../stores/Store";
import { IsPausedHow } from "../utils/is_paused";
import { t } from "i18next";
import Badges from "../components/SizeBadge";
import AddressBagCard from "../components/Bags/AddressBagCard";
import {
  chainChangeUserNote,
  chainGetUserNote,
  chainChangeUserWarden,
} from "../api/chain";
import { checkmarkCircle } from "ionicons/icons";
import {
  IonTextareaCustomEvent,
  TextareaInputEventDetail,
} from "@ionic/core/dist/types/components";
import { userUpdate } from "../api/user";

export default function AddressItem({
  match,
}: RouteComponentProps<{ uid: string }>) {
  const { chainUsers, chain, isChainAdmin, bags, authUser, setChain, refresh } =
    useContext(StoreContext);
  const user = useMemo(() => {
    let userUID = match.params.uid;
    return chainUsers.find((u) => u.uid === userUID) || null;
  }, [match.params.uid, chainUsers]);
  const isUserPaused = IsPausedHow(user, chain?.uid);

  const userBags = useMemo(() => {
    return bags.filter((b) => b.user_uid === user?.uid);
  }, [bags, authUser]);
  const [timer, setTimer] = useState<number | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const ref = useRef<HTMLIonTextareaElement>(null);

  const isNoteEditable =
    isChainAdmin || authUser?.uid === user?.uid || authUser?.is_root_admin;
  const [note, setNote] = useState("");
  const [isChainWarden, setIsChainWarden] = useState(false);
  const [isChainHost, setIsChainHost] = useState(false);
  useEffect(() => {
    if (!chain || !user) return;
    chainGetUserNote(chain.uid, user.uid).then((n) => {
      setShowSaved(true);
      if (timer) clearTimeout(timer);
      setNote(n);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!chain || !user) return;
    const _isChainWarden =
      user.chains.find((uc) => uc.chain_uid === chain?.uid)?.is_chain_warden ||
      false;

    setIsChainWarden(_isChainWarden);
    const _isChainHost =
      user.chains.find((uc) => uc.chain_uid === chain?.uid)?.is_chain_admin ||
      false;
    setIsChainHost(_isChainHost);
  }, []);

  function onChangeNoteInput(
    e: IonTextareaCustomEvent<TextareaInputEventDetail>,
  ) {
    setShowSaved(false);
    setNote(e.detail.value as any);
    if (!isNoteEditable) false;
    if (timer) clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        if (!chain || !user) return;
        const note = ref.current?.value || "";
        chainChangeUserNote(chain.uid, user.uid, note);
        setShowSaved(true);
      }, 1300) as any,
    );
  }
  async function handlePauseButton(isUserPaused: boolean) {
    if (!user || !chain) return;
    await userUpdate({
      user_uid: user.uid,
      chain_uid: chain.uid,
      chain_paused: !isUserPaused,
    }).catch((err) => console.error);
    await refresh("address");
  }

  function onChangeWarden(assign: boolean) {
    if (!chain || !user) return;
    chainChangeUserWarden(chain.uid, user.uid, assign)
      .then(() => {
        setChain(chain?.uid, authUser);
        setIsChainWarden(assign);
      })
      .catch((error) => console.log(error));
  }

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
            isUserPaused={isUserPaused.sum}
            showMessengers
          />
        ) : null}

        {isChainAdmin ? (
          <>
            <IonItem lines="none" className="ion-align-items-start">
              <IonLabel className="!tw-font-bold">
                {t("interestedSizes")}
              </IonLabel>
              <div className="ion-margin-top ion-margin-bottom" slot="end">
                {user ? <Badges categories={[]} sizes={user.sizes} /> : null}
              </div>
            </IonItem>
            <IonItem
              lines="none"
              onClick={() => handlePauseButton(isUserPaused.chain)}
            >
              <IonLabel className="ion-text-wrap">
                <h3 className="!tw-font-bold">{t("pauseParticipation")}</h3>
                <p className="ion-no-wrap">{t("onlyForThisLoop")}</p>
              </IonLabel>
              <IonToggle
                slot="end"
                className="ion-toggle-pause"
                color="medium"
                // disabled={Boolean(isUserPaused.user)}
                checked={isUserPaused.chain}
                onIonChange={(e) => {
                  e.target.checked = !e.detail.checked;
                }}
              />
            </IonItem>
          </>
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
        {isChainAdmin && !isChainHost ? (
          <IonItem
            lines="none"
            button
            detail={false}
            onClick={() => onChangeWarden(!isChainWarden)}
          >
            <IonLabel>
              <h3 className="!tw-font-bold">{t("assignWarden")}</h3>
              <IonToggle
                checked={isChainWarden}
                color="primary"
                justify="space-between"
              >
                {isChainWarden ? t("removeWarden") : t("assignWarden")}
              </IonToggle>
            </IonLabel>
          </IonItem>
        ) : null}

        {note || isNoteEditable ? (
          <IonItem lines="none">
            <div className="tw-w-full tw-mt-2 tw-mb-4">
              <IonLabel className="!tw-font-bold !tw-max-w-full">
                {t("notes")} <small>({t("visibleForAllLoop")})</small>
              </IonLabel>
              <div className="tw-relative tw-border tw-border-green tw-bg-green-contrast dark:tw-bg-background">
                <IonTextarea
                  ref={ref}
                  className="tw-px-2 !tw-min-h-[200px]"
                  value={note}
                  readonly={!isNoteEditable}
                  onIonInput={onChangeNoteInput}
                  autoGrow
                  autocapitalize="sentences"
                />
                <div className="tw-absolute tw-bottom-0 tw-right-0">
                  {showSaved && isNoteEditable ? (
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
        ) : null}
      </IonContent>
    </IonPage>
  );
}
