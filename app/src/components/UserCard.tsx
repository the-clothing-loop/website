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
} from "@ionic/react";
import { shield } from "ionicons/icons";
import { User } from "../api";

export default function UserCard({
  user,
  isUserAdmin,
}: {
  user: User;
  isUserAdmin: boolean;
}) {
  return (
    <IonCard color="light">
      <IonCardHeader>
        <IonCardTitle>
          {user?.name}
          {isUserAdmin ? (
            <IonIcon icon={shield} className="ion-margin-start" />
          ) : null}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList style={{ "--ion-item-background": "var(--ion-color-light)" }}>
          <IonItem lines="none">
            <IonLabel>Interested Sizes</IonLabel>
            <div slot="end">
              {user?.sizes.map((size) => (
                <IonBadge className="ion-margin-start" key={size}>
                  {size}
                </IonBadge>
              ))}
            </div>
          </IonItem>
          <IonItem lines="none">
            <IonLabel>Email</IonLabel>
            <IonText>{user?.email}</IonText>
          </IonItem>

          <IonItem lines="none">
            <IonLabel>Phone number</IonLabel>
            <IonText>{user?.phone_number}</IonText>
          </IonItem>
          <IonItem lines="none">
            <IonLabel>Address</IonLabel>
            <IonText>{user?.address}</IonText>
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>
  );
}
