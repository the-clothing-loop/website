import {
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonText,
  IonButton,
  IonImg,
} from "@ionic/react";
import { pauseCircleSharp, shield } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { Chain, SizeI18nKeys, User } from "../api";
import IsPrivate from "../utils/is_private";
import { IsChainAdmin } from "../Store";
import { useMemo } from "react";

export default function UserCard({
  user,
  chain,
  isUserPaused,
}: {
  user: User;
  chain: Chain | null;
  isUserPaused: boolean;
}) {
  const { t } = useTranslation();
  const isAddressPrivate = IsPrivate(user.address);
  const isEmailPrivate = IsPrivate(user.email);
  const isUserAdmin = useMemo(() => IsChainAdmin(user, chain), [user, chain]);
  return (
    <div>
      <div className="ion-padding">
        <IonText>
          <h1 className="ion-no-margin" style={{ position: "relative" }}>
            {user?.name}
            {isUserAdmin ? (
              <IonIcon
                icon={shield}
                color="primary"
                style={{
                  width: "18px",
                  height: "18px",
                  margin: 0,
                  marginLeft: "5px",
                  verticalAlign: "text-top",
                }}
              />
            ) : null}

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
          </h1>
        </IonText>
      </div>
      <IonList>
        <IonItem lines="none">
          <IonLabel>
            <h3>{t("interestedSizes")}</h3>
            <div className="ion-text-wrap">
              {user?.sizes.map((size) => (
                <IonBadge className="ion-margin-end" key={size}>
                  {SizeI18nKeys[size]}
                </IonBadge>
              ))}
            </div>
          </IonLabel>
        </IonItem>
        {isEmailPrivate ? null : (
          <>
            <IonItem lines="none">
              <IonLabel>
                <h3>{t("email")}</h3>
                {user?.email ? (
                  <a className="ion-text-wrap" href={"mailto:" + user.email}>
                    {user.email}
                  </a>
                ) : null}
              </IonLabel>
            </IonItem>

            <IonItem lines="none">
              <IonLabel>
                <h3>{t("phoneNumber")}</h3>
                {user.phone_number ? (
                  <a href={"tel:" + user.phone_number}>{user.phone_number}</a>
                ) : null}
              </IonLabel>
            </IonItem>
          </>
        )}
        {isAddressPrivate ? null : (
          <IonItem lines="none">
            <IonLabel>
              <h3>{t("address")}</h3>
              {/* https://www.google.com/maps/@${long},${lat},14z */}
              <p className="ion-text-wrap">{user?.address}</p>
            </IonLabel>
            {user.address ? (
              <IonButton
                slot="end"
                fill="clear"
                size="small"
                rel="noreferrer"
                target="_blank"
                href={
                  `https://www.google.com/maps/search/` +
                  user.address.replaceAll(" ", "+")
                }
              >
                <IonImg
                  slot="icon-only"
                  style={{ width: 24, height: 24 }}
                  src="/google_maps_logo.svg"
                />
              </IonButton>
            ) : null}
          </IonItem>
        )}
      </IonList>
    </div>
  );
}
