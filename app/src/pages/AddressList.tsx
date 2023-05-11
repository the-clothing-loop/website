import {
  IonContent,
  IonHeader,
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

export default function AddressList() {
  const { chainUsers, route } = useContext(StoreContext);
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
            return (
              <IonItem
                lines="full"
                routerLink={"/address/" + user.uid}
                key={user.uid}
              >
                <IonText
                  style={{
                    marginTop: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <h5 className="ion-no-margin">{user.name}</h5>
                  <small>{user.address}</small>
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
