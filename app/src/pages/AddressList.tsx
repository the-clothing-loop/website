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
import {
  bagHandle,
  pauseCircleSharp,
  personCircleOutline,
} from "ionicons/icons";
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
            return (
              <IonItem
                lines="full"
                routerLink={isPrivate ? undefined : "/address/" + user.uid}
                key={user.uid}
                color={isUserPaused ? "light" : undefined}
              >
                <IonText
                  className="ion-text-ellipsis"
                  style={{
                    marginTop: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <h5
                    className="ion-no-margin"
                    style={
                      isUserPaused
                        ? {
                            color: "var(--ion-color-medium)",
                          }
                        : {}
                    }
                  >
                    {user.name}

                    {isMe ? (
                      <IonIcon
                        icon={personCircleOutline}
                        color="medium"
                        style={{
                          width: "18px",
                          height: "18px",
                          margin: 0,
                          marginLeft: 5,
                          verticalAlign: "text-top",
                        }}
                      />
                    ) : null}
                    {userBags.map((b) => (
                      <IonIcon
                        icon={bagHandle}
                        style={{ color: b.color, marginLeft: 5 }}
                        key={b.id}
                      />
                    ))}
                  </h5>
                  {isUserPaused ? (
                    <small
                      style={{
                        color: "var(--ion-color-medium)",
                      }}
                    >
                      {t("paused")}
                    </small>
                  ) : isAddressPrivate ? (
                    <small>&nbsp;</small>
                  ) : (
                    <small>{user.address}</small>
                  )}
                </IonText>
                <IonText
                  slot="start"
                  color="medium"
                  className="ion-text-bold"
                  style={{
                    width: 30,
                    textWrap: "nowrap",
                  }}
                >
                  {isUserPaused ? (
                    <IonIcon
                      icon={pauseCircleSharp}
                      color="medium"
                      // size="large"
                      style={{
                        width: 24,
                        height: 24,
                        margin: 0,
                        verticalAlign: "text-top",
                      }}
                    />
                  ) : (
                    <span>{"#" + (i + 1)}</span>
                  )}
                </IonText>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
