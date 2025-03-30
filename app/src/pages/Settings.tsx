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
  useIonRouter,
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
import { StoreContext } from "../stores/Store";
import UserCard from "../components/UserCard";
import { Trans, useTranslation } from "react-i18next";
import {
  compassOutline,
  construct,
  copyOutline,
  ellipsisHorizontal,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  logoAndroid,
  logoApple,
  notificationsOutline,
  openOutline,
  shareOutline,
  sparkles,
  warningOutline,
} from "ionicons/icons";
import dayjs from "../dayjs";
import IsPaused, { IsPausedHow } from "../utils/is_paused";
import Badges from "../components/SizeBadge";
import { Share } from "@capacitor/share";
import { Clipboard } from "@capacitor/clipboard";
import Theme from "../components/Theme";
import { useLocation } from "react-router";
import { useLongPress } from "use-long-press";
import EditHeaders from "../components/EditHeaders";
import HeaderTitle from "../components/HeaderTitle";
import RoutePrivacyInput from "../components/Settings/RoutePrivacyInput";
import { chainUpdate } from "../api/chain";
import { el } from "@faker-js/faker";
import {
  OneSignalCheckPermissions,
  OneSignalRequestPermissions,
} from "../onesignal";
import { userUpdate } from "../api/user";
const VERSION = import.meta.env.VITE_APP_VERSION;

type State = { openChainSelect?: boolean } | undefined;

export default function Settings() {
  const { t, i18n } = useTranslation();
  const {
    authUser,
    chain,
    setPause,
    logout,
    leaveLoop,
    getChainHeader,
    setChain,
    isChainAdmin,
    isThemeDefault,
    listOfChains,
    bags,
    refresh,
  } = useContext(StoreContext);
  const [present] = useIonToast();
  const { state } = useLocation<State>();
  const [presentActionSheet] = useIonActionSheet();
  const [presentAlert] = useIonAlert();
  const refSelectPauseExpiryModal = useRef<HTMLIonModalElement>(null);
  const headerSheetModal = useRef<HTMLIonModalElement>(null);
  const subHeaderSheetModal = useRef<HTMLIonModalElement>(null);
  const refChainSelect = useRef<HTMLIonSelectElement>(null);
  const [isCapacitor] = useState(isPlatform("capacitor"));
  const [isIos] = useState(isPlatform("ios"));
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    null | boolean
  >(null);
  const userBags = bags.filter((b) => b.user_uid === authUser?.uid);
  const router = useIonRouter();

  // Check notification permissions every 3 seconds
  useEffect(() => {
    let n = setInterval(() => {
      OneSignalCheckPermissions().then(setNotificationPermission);
    }, 3000);
    return () => {
      clearInterval(n);
    };
  }, []);

  useEffect(() => {
    if (!authUser) return;
    if (!chain || state?.openChainSelect) {
      refChainSelect.current?.open();
    }
    OneSignalCheckPermissions().then(setNotificationPermission);
  }, [authUser, state]);

  const longPressSubHeader = useLongPress(() => {
    subHeaderSheetModal.current?.present();
  });

  const headerKey = "settings";
  const subHeaderKey = "settingsSub";

  function refreshBags() {
    setChain(chain?.uid, authUser);
  }
  const headerText = getChainHeader(headerKey, t("account"));
  const subHeader = getChainHeader(subHeaderKey, t("loopInformation"));

  function handleChainSelect(
    e: IonSelectCustomEvent<SelectChangeEventDetail<any>>,
  ) {
    const chainUID = e.detail.value;
    const c = listOfChains.find((c) => c.uid === chainUID) || null;

    setChain(c?.uid, authUser);
  }
  function handleEnableNotifications() {
    OneSignalRequestPermissions().finally(() => {
      OneSignalCheckPermissions().then(setNotificationPermission);
    });
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
          handler: () => {
            const uc = authUser?.chains.find(
              (uc) => uc.chain_uid === chain?.uid,
            );
            if (uc && chain && uc.is_paused) {
              setPause(false, chain.uid);
            } else {
              setPause(false);
            }
          },
          role: "destructive",
        },
      ]);
    } else if (userBags.length > 0) {
      presentActionSheet({
        header: "You are holding a bag. Are you sure you want to pause?",

        buttons: [
          {
            text: t("Yes, pause participation"),
            handler: async () => {
              await dismissCurrentActionSheet();
              showPauseOptions();
            },
          },
          {
            text: t("No, go to bags"),
            handler: () => router.push("/bags", "root"),
          },
          {
            text: t("cancel"),
            role: "cancel",
          },
        ],
      });
    } else {
      showPauseOptions();
    }
  }

  async function showPauseOptions() {
    console.log("here");
    await presentActionSheet({
      header: t("pauseUntil"),

      buttons: [
        {
          text: t("selectPauseDuration"),
          handler: () =>
            setTimeout(() => refSelectPauseExpiryModal.current?.present(), 100),
        },
        {
          text: t("pauseOnlyLoop"),
          handler: () => setPause(true, chain!.uid),
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
  async function dismissCurrentActionSheet() {
    const actionSheet = document.querySelector("ion-action-sheet");
    if (actionSheet) {
      await actionSheet.dismiss();
    }
  }
  async function updateUser(isUserPaused: boolean) {
    await userUpdate({
      user_uid: authUser?.uid,
      chain_uid: chain?.uid,
      chain_paused: !isUserPaused,
    }).catch((err) => console.error(err));
    await refresh("settings");
  }
  async function handleChangeRoutePrivacy(rp: number) {
    if (!chain) return;
    await chainUpdate({
      uid: chain.uid,
      route_privacy: rp,
    });

    await setChain(chain.uid, authUser);
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

  let pausedFromNow = "";
  const isUserPausedHow = IsPausedHow(authUser, chain?.uid);
  const isUserPaused = isUserPausedHow.chain || Boolean(isUserPausedHow.user);
  if (authUser && isUserPaused) {
    let pausedDayjs = dayjs(authUser.paused_until);

    if (isUserPausedHow.chain) {
      pausedFromNow = t("onlyForThisLoop");
    } else if (isUserPausedHow.user) {
      const now = dayjs();
      if (isUserPausedHow.user.year() < now.add(20, "year").year()) {
        if (pausedDayjs.isBefore(now.add(7, "day"))) {
          pausedFromNow = t("day", {
            count: pausedDayjs.diff(now, "day") + 1,
          });
        } else {
          pausedFromNow = t("week", {
            count: pausedDayjs.diff(now, "week"),
          });
        }
      } else {
        pausedFromNow = t("untilITurnItBackOn");
      }
    }
  }

  let showExpandButton = (chain?.description.length || 0) > 200;
  let emptyDescription = (chain?.description.length || 0) == 0;

  return (
    <IonPage>
      <IonHeader collapse="fade">
        <IonToolbar>
          <IonTitle
            className={`${
              isThemeDefault ? "tw-text-orange tw-bg-orange-shade" : ""
            }`}
            color={"background"}
          >
            {t("information")}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        class={isThemeDefault ? "tw-bg-orange-contrast" : ""}
      >
        <IonItemDivider className="ion-margin-top tw-bg-transparent">
          <HeaderTitle
            headerText={headerText}
            onEdit={() => headerSheetModal.current?.present()}
            isChainAdmin={isChainAdmin}
            className={`tw-relative tw-text-2xl tw-font-serif tw-font-bold ${
              isThemeDefault ? "tw-text-orange dark:tw-text-orange" : ""
            }`}
          />

          <IonButton
            fill="clear"
            className="tw-absolute tw-top tw-right-0 tw-normal-case tw-mr-8 tw-text-base"
            href={`https://www.clothingloop.org/${i18n.resolvedLanguage}/users/edit/?user=me`}
            target="_blank"
          >
            {t("edit")}
            <IonIcon icon={openOutline} className="tw-text-sm tw-ml-1" />
          </IonButton>
        </IonItemDivider>
        <IonCard
          className={`tw-mt-1.5 tw-rounded-none tw-relative ion-card ${
            isThemeDefault ? "tw-bg-orange-contrast" : "tw-bg-background"
          }`}
          color={"background"}
        >
          {authUser ? (
            <UserCard
              user={authUser}
              chain={chain}
              isUserPaused={isUserPaused}
              showEmail
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
            {notificationPermission === false ? (
              <IonItem
                onClick={handleEnableNotifications}
                lines="none"
                detail={false}
              >
                <IonLabel>{t("enableNotifications")}</IonLabel>
                <IonIcon
                  slot="end"
                  icon={notificationsOutline}
                  color="primary"
                />
              </IonItem>
            ) : null}
          </IonList>
        </IonCard>
        <IonList style={{ "--ion-item-background": "transparent" }}>
          {isChainAdmin ? (
            <IonItemDivider
              className={`ion-margin-start tw-bg-transparent tw-text-2xl tw-font-serif tw-font-bold
          ${isThemeDefault ? "tw-text-orange" : ""}`}
              {...longPressSubHeader()}
            >
              {subHeader}
              <IonIcon
                icon={construct}
                onClick={() => subHeaderSheetModal.current?.present()}
                className="tw-text-sm tw-ml-1.5 !tw-text-blue tw-cursor-pointer"
              />
            </IonItemDivider>
          ) : (
            <IonItemDivider
              className={`ion-margin-start tw-bg-transparent tw-text-2xl tw-font-serif tw-font-bold
            ${isThemeDefault ? "tw-text-orange" : ""}`}
            >
              {subHeader}
            </IonItemDivider>
          )}

          <IonCard
            className={`tw-mt-1.5 tw-rounded-none ${
              isThemeDefault ? "tw-bg-orange-contrast" : "tw-bg-background"
            }`}
            color="background"
          >
            <IonList>
              <IonItemDivider className="tw-bg-transparent tw-font-normal tw-text-sm tw-pb-0 -tw-mb-9">
                {t("selectALoop")}
              </IonItemDivider>
              <IonItem lines="none">
                <IonSelect
                  ref={refChainSelect}
                  aria-label={t("selectALoop")}
                  className="tw-text-2xl tw-relative tw-z-10 tw-mt-5"
                  labelPlacement="floating"
                  justify="space-between"
                  value={chain?.uid || ""}
                  onIonChange={handleChainSelect}
                  interface="action-sheet"
                  interfaceOptions={{ header: t("selectALoop") }}
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
              {chain ? (
                <>
                  {chain.is_app_disabled ? (
                    <IonItem lines="none" color="danger">
                      <IonIcon
                        size="small"
                        icon={isIos ? logoApple : logoAndroid}
                      />
                      <span className="ion-margin-end tw-ms-1.5">
                        {t("loopIsNotUsingThisApp", { name: chain.name })}
                      </span>
                    </IonItem>
                  ) : null}
                  {!chain.open_to_new_members || !chain.published ? (
                    <IonItem
                      lines="none"
                      color={
                        !chain.published
                          ? "warning"
                          : !chain.is_app_disabled
                            ? "medium"
                            : "danger"
                      }
                    >
                      {!chain.open_to_new_members ? (
                        <>
                          <IonIcon size="small" icon={lockClosedOutline} />
                          <span
                            key="closed"
                            className="ion-margin-end tw-ms-1.5"
                          >
                            {t("closed")}
                          </span>
                        </>
                      ) : null}
                      {chain.published ? (
                        <>
                          <IonIcon size="small" icon={eyeOutline} />
                          <span key="visible" className="tw-ms-1.5">
                            {t("visible")}
                          </span>
                        </>
                      ) : (
                        <>
                          <IonIcon size="small" icon={eyeOffOutline} />
                          <span key="closed" className="tw-ms-1.5">
                            {t("draft")}
                          </span>
                        </>
                      )}
                    </IonItem>
                  ) : null}
                  {isChainAdmin && authUser ? (
                    <>
                      <IonItem
                        lines="none"
                        button
                        id="open-modal-theme"
                        detail={false}
                      >
                        <IonLabel>{t("setLoopTheme")}</IonLabel>
                        <IonIcon slot="end" icon={sparkles} color="primary" />
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
                      <RoutePrivacyInput
                        chain={chain}
                        authUser={authUser}
                        onChange={handleChangeRoutePrivacy}
                      />
                    </>
                  ) : null}
                  {chain.published ? (
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
                    <div
                      className="ion-margin-top ion-margin-bottom"
                      slot="end"
                    >
                      {chain ? (
                        <Badges
                          categories={chain.genders}
                          sizes={chain.sizes}
                        />
                      ) : null}
                    </div>
                  </IonItem>
                  {!emptyDescription ? (
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
                            <IonIcon
                              icon={ellipsisHorizontal}
                              color="primary"
                            />
                          </IonButton>
                        ) : null}
                      </IonLabel>
                    </IonItem>
                  ) : null}
                </>
              ) : null}
            </IonList>
          </IonCard>
        </IonList>
        <div className="ion-padding tw-mt-4">
          <IonButton id="settings-logout-btn" expand="block" color="danger">
            {t("logout")}
          </IonButton>
          {chain && !isChainAdmin ? (
            <IonButton
              id="settings-leaveloop-btn"
              expand="block"
              color="danger"
              className="tw-mt-4"
            >
              {t("leaveLoop")}
            </IonButton>
          ) : null}
        </div>
        <div className="relative">
          {/* Background SVGs */}
          <IonIcon
            aria-hidden="true"
            icon="/v2_o_pattern_green.svg"
            style={{ fontSize: 400 }}
            color={isThemeDefault ? "" : "light"}
            className={`tw-absolute -tw-left-28 -tw-bottom-[190px] -tw-z-10 ${
              isThemeDefault
                ? "tw-text-orange-shade dark:tw-text-red-shade"
                : ""
            }`}
          />
          <IonIcon
            aria-hidden="true"
            icon="/v2_o.svg"
            style={{ fontSize: 500 }}
            color={isThemeDefault ? "" : "light"}
            className="tw-absolute tw-opacity-60 -tw-right-64 tw-top-[90px] -tw-z-10 tw-text-orange-shade dark:tw-text-red-shade"
          />
        </div>
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
        <IonAlert
          trigger="settings-leaveloop-btn"
          header={t("leaveLoop")!}
          message={t("areYouSureYouWantToLeaveN", { name: chain?.name })!}
          buttons={[
            {
              text: t("cancel"),
            },
            {
              text: t("leaveLoop"),
              role: "destructive",
              handler: leaveLoop,
            },
          ]}
        ></IonAlert>
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
          <IonItem lines="full" routerLink="/settings/open-source">
            <IonLabel color="medium">{t("openSource")}</IonLabel>
          </IonItem>
          <IonItem lines="none" detail={false}>
            <IonLabel color="medium" className="ion-text-wrap">
              <h3 className="mb-3">
                {t("deleteAccount")}
                <IonIcon
                  color="danger"
                  icon={warningOutline}
                  className="tw-ml-1"
                />
              </h3>
              <p>
                <Trans
                  t={t}
                  i18nKey="deleteAccountExplanation"
                  components={{
                    "1": (
                      <a
                        href="https://clothingloop.org/admin/dashboard"
                        target="_blank"
                        className="tw-text-danger tw-font-medium"
                      />
                    ),
                  }}
                />
              </p>
            </IonLabel>
          </IonItem>
        </IonList>
        {isChainAdmin ? (
          <div>
            <EditHeaders
              modal={headerSheetModal}
              didDismiss={refreshBags}
              headerKey={headerKey}
              initialHeader={headerText}
            />
            <EditHeaders
              modal={subHeaderSheetModal}
              didDismiss={refreshBags}
              headerKey={subHeaderKey}
              initialHeader={subHeader}
            />
          </div>
        ) : null}
      </IonContent>
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
