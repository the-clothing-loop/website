import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonText,
  IonTitle,
} from "@ionic/react";
import { shield } from "ionicons/icons";
import { SizeI18nKeys, User } from "../api";

export default function UserCard({
  user,
  isUserAdmin,
}: {
  user: User;
  isUserAdmin: boolean;
}) {
  return (
    <div>
      <div className="ion-padding">
        <IonText>
          <h1 className="ion-no-margin">{user?.name}</h1>
          {isUserAdmin ? (
            <IonIcon icon={shield} className="ion-margin-start" />
          ) : null}
        </IonText>
      </div>
      <IonList>
        <IonItem lines="none">
          <IonLabel>
            <h3>Interested Sizes</h3>
            <div className="ion-text-wrap">
              {user?.sizes.map((size) => (
                <IonBadge className="ion-margin-end" key={size}>
                  {SizeI18nKeys[size]}
                </IonBadge>
              ))}
            </div>
          </IonLabel>
        </IonItem>
        <IonItem lines="none">
          <IonLabel>
            <h3>Email</h3>
            {user?.email ? (
              <a href={"mailto:" + user.email}>{user.email}</a>
            ) : null}
          </IonLabel>
        </IonItem>

        <IonItem lines="none">
          <IonLabel>
            <h3>Phone number</h3>
            {user.phone_number ? (
              <a href={"tel:" + user.phone_number}>{user.phone_number}</a>
            ) : null}
          </IonLabel>
        </IonItem>
        <IonItem lines="none">
          <IonLabel>
            <h3>Address</h3>
            {/* https://www.google.com/maps/@${long},${lat},14z */}
            <p>{user?.address}</p>
          </IonLabel>
        </IonItem>
      </IonList>
    </div>
  );
}
