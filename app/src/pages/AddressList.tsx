import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../Store";
import { bagHandle, pauseCircleSharp, shield } from "ionicons/icons";
import isPaused from "../utils/is_paused";
import IsPrivate from "../utils/is_private";

export default function AddressList() {
  const { chain, chainUsers, route, authUser, bags, isChainAdmin } =
    useContext(StoreContext);
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("addresses")}</IonTitle>
          {isChainAdmin ? (
            <IonButtons slot="end">
              <IonButton
                target="_blank"
                href={`https://www.clothingloop.org/loops/${chain?.uid}/members`}
              >
                {t("routeOrder")}
              </IonButton>
            </IonButtons>
          ) : null}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("addresses")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
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
      </IonContent>
    </IonPage>
  );
}
