import {
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
import { pauseCircleSharp, personCircleOutline } from "ionicons/icons";
import isPaused from "../utils/is_paused";
import IsPrivate from "../utils/is_private";

export default function AddressList() {
  const { chainUsers, route, authUser } = useContext(StoreContext);
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("addresses")}</IonTitle>
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
            return (
              <IonItem
                lines="full"
                routerLink={isPrivate ? undefined : "/address/" + user.uid}
                key={user.uid}
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
                    {isUserPaused ? (
                      <IonIcon
                        icon={pauseCircleSharp}
                        color="medium"
                        style={{
                          width: "18px",
                          height: "18px",
                          margin: 0,
                          marginLeft: "5px",
                          verticalAlign: "text-top",
                        }}
                      />
                    ) : null}
                    {isMe ? (
                      <IonIcon
                        icon={personCircleOutline}
                        color="medium"
                        style={{
                          width: "18px",
                          height: "18px",
                          margin: 0,
                          marginLeft: "5px",
                          verticalAlign: "text-top",
                        }}
                      />
                    ) : null}
                  </h5>
                  {isAddressPrivate ? (
                    <small>&nbsp;</small>
                  ) : (
                    <small>{user.address}</small>
                  )}
                </IonText>
                <IonText slot="start" color="medium" className="ion-text-bold">
                  #{i + 1}
                </IonText>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
