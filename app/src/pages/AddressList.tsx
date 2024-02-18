import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../Store";
import {
  bagHandle,
  openOutline,
  pauseCircleSharp,
  shield,
} from "ionicons/icons";
import isPaused from "../utils/is_paused";
import IsPrivate from "../utils/is_private";
import OverlayPaused from "../components/OverlayPaused";
import OverlayAppDisabled from "../components/OverlayChainAppDisabled";
import EditHeaders from "../components/EditHeaders";

export default function AddressList() {
  const {
    chain,
    setChain,
    chainUsers,
    route,
    authUser,
    bags,
    isChainAdmin,
    isThemeDefault,
    shouldBlur,
  } = useContext(StoreContext);
  const { t } = useTranslation();
  const headerSheetModal = useRef<HTMLIonModalElement>(null);

  const header = useMemo(() => {
    if (chain?.headers_override) {
      const headers = JSON.parse(chain.headers_override);
      return headers.addressList
        ? (headers.addressList as string)
        : t("addresses");
    }
    return t("addresses");
  }, [chain]);

  function updateChain() {
    setChain(chain?.uid, authUser);
  }
  function handleClickEdit() {
    headerSheetModal.current?.present();
  }

  return (
    <IonPage>
      <OverlayPaused />
      <OverlayAppDisabled />
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{header}</IonTitle>
          {isChainAdmin ? (
            <IonButtons
              slot="end"
              className={`${
                isThemeDefault
                  ? "tw-text-red dark:tw-text-red-contrast"
                  : "primary"
              }`}
            >
              {" "}
              <IonButton onClick={handleClickEdit}>{t("edit")}</IonButton>
              <IonButton
                target="_blank"
                href={`https://www.clothingloop.org/loops/${chain?.uid}/members`}
                color={
                  isThemeDefault
                    ? "tw-text-red dark:tw-text-red-contrast"
                    : "primary"
                }
              >
                {t("routeOrder")}
                <IonIcon icon={openOutline} className="tw-text-sm tw-ml-1" />
              </IonButton>
            </IonButtons>
          ) : null}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="tw-relative tw-min-h-full tw-flex tw-flex-col">
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle
                size="large"
                className={"tw-font-serif".concat(
                  isThemeDefault
                    ? " tw-text-red dark:tw-text-red-contrast"
                    : "",
                )}
              >
                {header}
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonList
            className={"tw-flex-grow".concat(shouldBlur ? " tw-blur" : "")}
          >
            {route.map((userUID, i) => {
              const user = chainUsers.find((u) => u.uid === userUID);
              if (!user) return null;
              const isMe = user.uid === authUser?.uid;
              const isUserPaused = isPaused(user.paused_until);
              const isPrivate = IsPrivate(user.email);
              const isAddressPrivate = IsPrivate(user.address);
              const userBags = bags.filter((b) => b.user_uid === user.uid);
              const isUserHost =
                user.chains.find((uc) => uc.chain_uid === chain?.uid)
                  ?.is_chain_admin || false;
              return (
                <IonItem
                  lines="full"
                  routerLink={isPrivate ? undefined : "/address/" + user.uid}
                  key={user.uid}
                  color={isUserPaused ? "light" : undefined}
                >
                  <IonText className="ion-text-ellipsis tw-my-1.5">
                    <h5
                      className={`ion-no-margin ${
                        isMe
                          ? "tw-text-primary"
                          : isUserPaused
                          ? "tw-text-medium"
                          : ""
                      }`}
                    >
                      {user.name}

                      {isUserHost ? (
                        <IonIcon
                          icon={shield}
                          color="medium"
                          className="tw-w-4 tw-h-4 tw-m-0 tw-ml-[5px] tw-align-text-top"
                        />
                      ) : null}
                    </h5>
                    <span className="tw-opacity-60">
                      {isUserPaused ? (
                        <small>{t("paused")}</small>
                      ) : isAddressPrivate ? (
                        <small>&nbsp;</small>
                      ) : (
                        <small>{user.address}</small>
                      )}
                    </span>
                  </IonText>
                  <IonText
                    slot="start"
                    color="medium"
                    className="!tw-font-bold tw-w-[30px] tw-whitespace-nowrap"
                  >
                    {isUserPaused ? (
                      <IonIcon
                        icon={pauseCircleSharp}
                        color="medium"
                        className="tw-w-6 tw-h-6 tw-m-0 tw-align-text-top "
                      />
                    ) : (
                      <span>{"#" + (i + 1)}</span>
                    )}
                  </IonText>
                  <div
                    slot="end"
                    style={{
                      width:
                        userBags.length < 4
                          ? 0
                          : 20 * Math.floor(userBags.length / 2),
                      paddingBottom: userBags.length < 4 ? 20 : 0,
                    }}
                    className="tw-flex tw-flex-col tw-h-10 tw-flex-wrap-reverse tw-items-end"
                  >
                    {userBags.map((b) => (
                      <IonIcon
                        icon={bagHandle}
                        style={{ color: b.color }}
                        className="tw-m-0.5"
                        key={b.id}
                      />
                    ))}
                  </div>
                </IonItem>
              );
            })}
          </IonList>
          <EditHeaders
            modal={headerSheetModal}
            didDismiss={updateChain}
            page={"addressList"}
            initalHeader={t("whereIsTheBag")}
          />
          <IonIcon
            aria-hidden="true"
            icon="/the_clothing_loop_logo_cropped.svg"
            style={{ fontSize: 150 }}
            className="tw-w-full -tw-mb-2 tw-invert-[60%] tw-overflow-hidden tw-stroke-text dark:tw-stroke-light-tint"
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
