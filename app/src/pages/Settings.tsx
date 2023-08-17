import {
  IonAlert,
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  SelectChangeEventDetail,
  useIonActionSheet,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { isPlatform, type IonSelectCustomEvent } from "@ionic/core";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Chain, chainGet } from "../api";
import { StoreContext } from "../Store";
import UserCard from "../components/UserCard";
import toastError from "../../toastError";
import { useTranslation } from "react-i18next";
import {
  compassOutline,
  copyOutline,
  ellipsisHorizontal,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  pauseCircle,
  shareOutline,
  stopCircle,
} from "ionicons/icons";
import dayjs from "../dayjs";
import isPaused from "../utils/is_paused";
import Badges from "../components/SizeBadge";
import { Share } from "@capacitor/share";
import { Clipboard } from "@capacitor/clipboard";

const VERSION = import.meta.env.VITE_APP_VERSION;

export default function Settings() {
  const { t } = useTranslation();
  const {
    authUser,
    chain,
    isAuthenticated,
    setPause,
    logout,
    setChain,
    isChainAdmin,
  } = useContext(StoreContext);
  const [present] = useIonToast();
  const [presentActionSheet] = useIonActionSheet();
  const [presentAlert] = useIonAlert();
  const refChainSelect = useRef<HTMLIonSelectElement>(null);
  const [isCapacitor] = useState(isPlatform("capacitor"));
  const [expandedDescription, setExpandedDescription] = useState(false);

  const [listOfChains, setListOfChains] = useState<Chain[]>([]);
  useEffect(() => {
    if (!authUser) {
      setListOfChains([]);
      return;
    }

    Promise.all(
      authUser.chains
        .filter((uc) => uc.is_approved)
        .map((uc) => chainGet(uc.chain_uid)),
    )
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
    e: IonSelectCustomEvent<SelectChangeEventDetail<any>>,
  ) {
    const chainUID = e.detail.value;
    const c = listOfChains.find((c) => c.uid === chainUID) || null;

    setChain(c, authUser!.uid);
  }

  function handlePauseButton(isUserPaused: boolean) {
    if (isUserPaused) {
      presentAlert(t("areYouSureUnPause"), [
        {
          text: t("cancel"),
          role: "cancel",
        },
        {
          text: t("unPause"),
          handler: () => setPause(0),
          role: "destructive",
        },
      ]);
    } else {
      presentActionSheet({
        header: t("pauseUntil"),
        buttons: [
          {
            text: t("week", { count: 10 }),
            handler: () => setPause(10),
          },
          {
            text: t("week", { count: 8 }),
            handler: () => setPause(8),
          },
          {
            text: t("week", { count: 6 }),
            handler: () => setPause(6),
          },
          {
            text: t("week", { count: 4 }),
            handler: () => setPause(4),
          },
          {
            text: t("week", { count: 3 }),
            handler: () => setPause(3),
          },
          {
            text: t("week", { count: 2 }),
            handler: () => setPause(2),
          },
          {
            text: t("week", { count: 1 }),
            handler: () => setPause(1),
          },
          {
            text: t("cancel"),
            role: "cancel",
          },
        ],
      });
    }
  }

  function handleShareLoop() {
    if (!chain) return;
    let url = `https://www.clothingloop.org/loops/${chain.uid}/users/signup`;
    if (!isCapacitor) {
      Clipboard.write({ url });
      present({
        message: t("copiedToClipboard"),
        color: "primary",
        duration: 1300,
      });
      return;
    }
    Share.share({ url });
  }

  let isUserPaused = isPaused(authUser?.paused_until || null);

  let pausedDayjs = isUserPaused && dayjs(authUser!.paused_until);
  let showExpandButton = (chain?.description.length || 0) > 200;

  return (
    <IonPage>
      <IonHeader collapse="fade" translucent>
        <IonToolbar>
          <IonTitle>{t("information")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      {isAuthenticated === true ? (
        <IonContent fullscreen color="light">
          <IonItemDivider
            className="ion-margin-start ion-margin-top ion-text-uppercase"
            style={{
              background: "transparent",
              color: "var(--ion-color-medium-shade)",
            }}
          >
            {t("account")}
          </IonItemDivider>
          <IonCard
            style={{
              marginTop: 6,
              "--background": "var(--ion-color-primary-contrast)",
            }}
          >
            {authUser ? (
              <UserCard
                user={authUser}
                chain={chain}
                isUserPaused={isUserPaused}
              />
            ) : null}
            <IonList>
              <IonItem
                lines="none"
                button
                onClick={() => handlePauseButton(isUserPaused)}
                detail={false}
              >
                <IonLabel className="ion-text-wrap">
                  <h3 className="ion-text-bold">{t("pauseParticipation")}</h3>
                  <p className="ion-no-wrap">
                    {pausedDayjs
                      ? pausedDayjs.fromNow()
                      : t("setTimerForACoupleOfWeeks")}
                  </p>
                </IonLabel>
                <IonButton slot="end" color="primary">
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
            </IonList>
          </IonCard>
          <IonList>
            <IonItemDivider
              className="ion-margin-start ion-text-uppercase"
              style={{
                background: "transparent",
                color: "var(--ion-color-medium-shade)",
              }}
            >
              {t("loopInformation")}
            </IonItemDivider>
            <IonCard
              style={{
                marginTop: 6,
                "--background": "var(--ion-color-primary-contrast)",
              }}
            >
              <IonList>
                <IonItem lines="none">
                  <IonSelect
                    ref={refChainSelect}
                    aria-label={t("selectALoop")}
                    style={{ fontSize: 26 }}
                    labelPlacement="floating"
                    justify="space-between"
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
                {chain && (!chain.open_to_new_members || !chain.published) ? (
                  <IonItem
                    lines="none"
                    color={chain.published ? "warning" : "danger"}
                  >
                    {!chain.open_to_new_members ? (
                      <>
                        <IonIcon size="small" icon={lockClosedOutline} />
                        <span
                          key="closed"
                          className="ion-margin-end"
                          style={{ marginInlineStart: 6 }}
                        >
                          {t("closed")}
                        </span>
                      </>
                    ) : null}
                    {!chain.published ? (
                      <>
                        <IonIcon size="small" icon={eyeOffOutline} />
                        <span key="closed" style={{ marginInlineStart: 6 }}>
                          {t("draft")}
                        </span>
                      </>
                    ) : (
                      <>
                        <IonIcon size="small" icon={eyeOutline} />
                        <span key="visible" style={{ marginInlineStart: 6 }}>
                          {t("visible")}
                        </span>
                      </>
                    )}
                  </IonItem>
                ) : null}
                {isChainAdmin && chain ? (
                  <IonItem
                    lines="none"
                    button
                    detail={false}
                    target="_blank"
                    href={`https://www.clothingloop.org/loops/${chain.uid}/members`}
                  >
                    <IonLabel>{t("goToAdminPortal")}</IonLabel>
                    <IonIcon icon={compassOutline} />
                  </IonItem>
                ) : null}
                {chain?.published ? (
                  <IonItem
                    lines="none"
                    button
                    detail={false}
                    onClick={handleShareLoop}
                  >
                    <IonLabel>{t("shareLoop")}</IonLabel>
                    <IonIcon
                      slot="end"
                      icon={isCapacitor ? shareOutline : copyOutline}
                    />
                  </IonItem>
                ) : null}
                <IonItem lines="none" className="ion-align-items-start">
                  <IonLabel>{t("interestedSizes")}</IonLabel>
                  <div className="ion-margin-top ion-margin-bottom" slot="end">
                    {chain ? (
                      <Badges genders={chain.genders} sizes={chain.genders} />
                    ) : null}
                  </div>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>{t("description")}</h3>
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        overflow: "hidden",
                        display: "block",
                        ...(!expandedDescription && showExpandButton
                          ? {
                              maxHeight: 60,
                            }
                          : {}),
                      }}
                    >
                      {chain?.description}
                    </p>
                    {!expandedDescription && showExpandButton ? (
                      <IonButton
                        onClick={() => setExpandedDescription((s) => !s)}
                        size="small"
                        color="clear"
                        expand="block"
                        style={{
                          marginTop: -6,
                          "--padding-start": "0px",
                          // "--padding-end": "5px",
                        }}
                      >
                        <IonIcon icon={ellipsisHorizontal} color="primary" />
                      </IonButton>
                    ) : null}
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCard>
          </IonList>

          <div className="ion-padding" style={{ marginTop: "1em" }}>
            <IonButton id="settings-logout-btn" expand="block" color="danger">
              Logout
            </IonButton>
            <IonAlert
              trigger="settings-logout-btn"
              header={t("logout")!}
              message={t("areYouSureYouWantToLogout")!}
              buttons={[
                {
                  text: t("cancel"),
                },
                {
                  text: t("logout"),
                  role: "destructive",
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
            <IonItem
              lines="full"
              routerLink="/settings/privacy-policy"
              style={{ "--border-width": "0.55px 0px 0.55px 0px" }}
            >
              <IonLabel color="medium">{t("privacyPolicy")}</IonLabel>
            </IonItem>
            <IonItem lines="none" routerLink="/settings/open-source">
              <IonLabel color="medium">{t("openSource")}</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      ) : null}
    </IonPage>
  );
}
