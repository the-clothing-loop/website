import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonChip,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  SelectChangeEventDetail,
  useIonActionSheet,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import {
  isPlatform,
  type IonSelectCustomEvent,
  DatetimeChangeEventDetail,
  IonDatetimeCustomEvent,
  IonModalCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
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
  openOutline,
  shareOutline,
  sparklesOutline,
} from "ionicons/icons";
import dayjs from "../dayjs";
import isPaused from "../utils/is_paused";
import Badges from "../components/SizeBadge";
import { Share } from "@capacitor/share";
import { Clipboard } from "@capacitor/clipboard";
import Theme from "../components/Theme";
const VERSION = import.meta.env.VITE_APP_VERSION;

export default function Settings() {
  const { t, i18n } = useTranslation();
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
  const refSelectPauseExpiryModal = useRef<HTMLIonModalElement>(null);
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
          handler: () => setPause(false),
          role: "destructive",
        },
      ]);
    } else {
      presentActionSheet({
        header: t("pauseUntil"),

        buttons: [
          {
            text: t("selectPauseDuration"),
            handler: () =>
              setTimeout(
                () => refSelectPauseExpiryModal.current?.present(),
                100,
              ),
          },
          {
            text: t("untilITurnItBackOn"),
            handler: () => {
              setPause(true);
            },
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
  let pausedDayjs = isUserPaused ? dayjs(authUser!.paused_until) : null;
  let showExpandButton = (chain?.description.length || 0) > 200;
  let pausedFromNow = "";
  {
    const now = dayjs();
    if (pausedDayjs) {
      if (pausedDayjs.year() < now.add(20, "year").year()) {
        if (pausedDayjs.isBefore(now.add(7, "day"))) {
          pausedFromNow = t("day", { count: pausedDayjs.diff(now, "day") + 1 });
        } else {
          pausedFromNow = t("week", {
            count: pausedDayjs.diff(now, "week"),
          });
        }
      } else {
        pausedFromNow = t("untilITurnItBackOn");
      }
    }
    console.log(
      "paused from now",
      "'" + pausedFromNow + "'",
      pausedDayjs?.year(),
      now.set("years", 20).isBefore(pausedDayjs),
      now.year(),
    );
  }

  return (
    <IonPage>
      <IonHeader collapse="fade" translucent>
        <IonToolbar>
          <IonTitle>{t("information")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      {isAuthenticated === true ? (
        <IonContent fullscreen color="light">
          <IonItemDivider className="tw-relative ion-margin-start ion-margin-top ion-text-uppercase tw-bg-transparent tw-text-medium-shade">
            {t("account")}
            <IonButton
              fill="clear"
              className="tw-absolute tw-top tw-right-0 tw-normal-case tw-mr-8 tw-text-base"
              href={`https://www.clothingloop.org/${i18n.resolvedLanguage}/users/me/edit`}
              target="_blank"
            >
              {t("edit")}
              <IonIcon icon={openOutline} className="tw-text-sm tw-ml-1" />
            </IonButton>
          </IonItemDivider>
          <IonCard className="tw-mt-1.5 tw-bg-background tw-relative">
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
                  <h3 className="!tw-font-bold">{t("pauseParticipation")}</h3>
                  <p className="ion-no-wrap">
                    <span>
                      {isUserPaused
                        ? t("yourParticipationIsPausedClick")
                        : t("setTimerForACoupleOfWeeks")}
                    </span>
                  </p>
                  {pausedFromNow ? (
                    <IonChip>
                      <IonLabel>{pausedFromNow}</IonLabel>
                    </IonChip>
                  ) : null}
                </IonLabel>
                <IonToggle
                  slot="end"
                  className="ion-toggle-pause"
                  color="medium"
                  checked={isUserPaused}
                  onIonChange={(e) => {
                    e.target.checked = !e.detail.checked;
                  }}
                />
              </IonItem>
              <SelectPauseExpiryModal
                modal={refSelectPauseExpiryModal}
                submit={(d) => setPause(d)}
              />
            </IonList>
          </IonCard>
          <IonList>
            <IonItemDivider className="ion-margin-start ion-text-uppercase tw-bg-transparent tw-text-medium-shade">
              {t("loopInformation")}
            </IonItemDivider>
            <IonCard className="tw-mt-1.5 tw-bg-background">
              <IonList>
                <IonItem lines="none">
                  <IonSelect
                    ref={refChainSelect}
                    aria-label={t("selectALoop")}
                    className="tw-text-2xl"
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
                        <span key="closed" className="ion-margin-end tw-ms-1.5">
                          {t("closed")}
                        </span>
                      </>
                    ) : null}
                    {!chain.published ? (
                      <>
                        <IonIcon size="small" icon={eyeOffOutline} />
                        <span key="closed" className="tw-ms-1.5">
                          {t("draft")}
                        </span>
                      </>
                    ) : (
                      <>
                        <IonIcon size="small" icon={eyeOutline} />
                        <span key="visible" className="tw-ms-1.5">
                          {t("visible")}
                        </span>
                      </>
                    )}
                  </IonItem>
                ) : null}
                {isChainAdmin && chain ? (
                  <>
                    <IonItem
                      lines="none"
                      button
                      id="open-modal-theme"
                      detail={false}
                    >
                      <IonLabel>{t("setLoopTheme")}</IonLabel>
                      <IonIcon slot="end" icon={sparklesOutline} />
                    </IonItem>
                    <Theme />

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
                  </>
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
                      className={`tw-whitespace-pre-wrap tw-overflow-hidden tw-block ${
                        !expandedDescription && showExpandButton
                          ? "tw-max-h-[60px]"
                          : ""
                      }`}
                    >
                      {chain?.description}
                    </p>
                    {!expandedDescription && showExpandButton ? (
                      <IonButton
                        onClick={() => setExpandedDescription((s) => !s)}
                        size="small"
                        color="clear"
                        expand="block"
                        className="-tw-mt-1.5 tw-ps-0"
                      >
                        <IonIcon icon={ellipsisHorizontal} color="primary" />
                      </IonButton>
                    ) : null}
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCard>
          </IonList>

          <div className="ion-padding tw-mt-4">
            <IonButton id="settings-logout-btn" expand="block" color="danger">
              {t("logout")}
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
          <IonText className="ion-text-center tw-block tw-text-medium tw-text-sm">
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

function SelectPauseExpiryModal({
  modal,
  submit,
}: {
  modal: RefObject<HTMLIonModalElement>;
  submit: (endDate: Date | boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const [endDate, setEndDate] = useState<Date>(new Date());
  function willPresent() {
    setEndDate(new Date());
  }
  function handleChangeDatetime(
    e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>,
  ) {
    let datetime = new Date(e.detail.value + "");
    setEndDate(datetime);
  }

  function didDismiss(e: IonModalCustomEvent<OverlayEventDetail<any>>) {
    if (e.detail.role === "submit") submit(e.detail.data);
  }
  return (
    <IonModal
      ref={modal}
      onIonModalDidDismiss={didDismiss}
      onIonModalWillPresent={willPresent}
      style={{
        "--width": "350px",
        "--height": "394px",
        "--border-radius": "10px",
      }}
    >
      <IonHeader>
        <IonToolbar style={{ "--ion-safe-area-top": 0 }}>
          <IonButtons slot="start">
            <IonButton onClick={() => modal.current?.dismiss(null, "dismiss")}>
              {t("cancel")}
            </IonButton>
          </IonButtons>
          <IonTitle>{t("pauseUntil")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => modal.current?.dismiss(endDate, "submit")}
            >
              {t("save")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent
        color="light"
        style={{
          width: 350,
          height: 350,
        }}
      >
        <IonDatetime
          className="tw-mx-auto"
          presentation="date"
          firstDayOfWeek={1}
          min={dayjs().add(1, "day").toISOString()}
          locale={i18n.language}
          onIonChange={handleChangeDatetime}
        ></IonDatetime>
      </IonContent>
    </IonModal>
  );
}
