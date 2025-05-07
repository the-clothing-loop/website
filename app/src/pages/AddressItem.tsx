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
  useIonActionSheet,
  IonRouterLink,
  useIonRouter,
} from "@ionic/react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import UserCard from "../components/UserCard";
import { IsChainAdmin, IsChainWarden, StoreContext } from "../stores/Store";
import { IsPausedHow } from "../utils/is_paused";
import Badges from "../components/SizeBadge";
import AddressBagCard from "../components/Bags/AddressBagCard";
import {
  chainChangeUserNote,
  chainGetUserNote,
  chainChangeUserWarden,
} from "../api/chain";
import { checkmarkCircle, flag } from "ionicons/icons";
import {
  IonModalCustomEvent,
  IonTextareaCustomEvent,
  OverlayEventDetail,
  TextareaInputEventDetail,
} from "@ionic/core/dist/types/components";
import { userUpdate } from "../api/user";
import { useTranslation } from "react-i18next";

export default function AddressItem({
  match,
}: RouteComponentProps<{ uid: string }>) {
  const { t } = useTranslation();
  const { chainUsers, chain, isChainAdmin, bags, authUser, refresh } =
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
  const [isUserWarden, isUserAdmin] = useMemo(
    () => [IsChainWarden(user, chain?.uid), IsChainAdmin(user, chain?.uid)],
    [user, chain],
  );
  const [presentActionSheet] = useIonActionSheet();

  useEffect(() => {
    if (!chain || !user) return;
    chainGetUserNote(chain.uid, user.uid).then((n) => {
      setShowSaved(true);
      if (timer) clearTimeout(timer);
      setNote(n);
    });
  }, [user?.uid]);

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
  const router = useIonRouter();

  function handlePauseButton(isUserPaused: boolean) {
    if (!user || !chain) return;

    if (userBags.length > 0 && !isUserPaused) {
      presentActionSheet({
        header: "You are holding a bag. Are you sure you want to pause?",

        buttons: [
          {
            text: t("YesPauseParticipation"),
            handler: () => updateUser(isUserPaused),
          },
          {
            text: t("NoGoToBags"),
            handler: () => router.push("/bags", "root"),
          },

          {
            text: t("cancel"),
            role: "cancel",
          },
        ],
      });
    } else updateUser(isUserPaused);
  }

  async function updateUser(isUserPaused: boolean) {
    await userUpdate({
      user_uid: user?.uid,
      chain_uid: chain?.uid,
      chain_paused: !isUserPaused,
    }).catch((err) => console.error(err));
    await refresh("address");
  }

  function onChangeWarden(assign: boolean) {
    if (!chain || !user) return;
    chainChangeUserWarden(chain.uid, user.uid, assign)
      .then(() => {
        refresh("address");
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
              <IonLabel
                className="ion-text-wrap"
                onClick={() => console.log(userBags.length)}
              >
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
        {isChainAdmin && !isUserAdmin ? (
          <IonItem
            lines="none"
            button
            detail={false}
            onClick={() => onChangeWarden(!isUserWarden)}
          >
            <IonLabel>
              <h3 className="!tw-font-bold">{t("assignWardenTitle")}</h3>
              <p>{t("assignWardenBody")}</p>
            </IonLabel>
            <IonToggle
              slot="end"
              className="ion-toggle-flag"
              checked={isUserWarden}
              color="primary"
              justify="space-between"
            ></IonToggle>
          </IonItem>
        ) : isUserWarden ? (
          <IonItem lines="none">
            <IonLabel>
              <h3 className="!tw-font-bold">{t("assignWardenTitle")}</h3>
              <p>{t("assignWardenBody")}</p>
            </IonLabel>
            <IonIcon slot="end" icon={flag} color="primary" />
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
