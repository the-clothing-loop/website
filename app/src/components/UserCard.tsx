import {
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonImg,
  IonContent,
  IonPopover,
} from "@ionic/react";
import { Clipboard } from "@capacitor/clipboard";
import {
  compassOutline,
  copyOutline,
  pauseCircleSharp,
  shareOutline,
  shield,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { Chain, User } from "../api";
import IsPrivate from "../utils/is_private";
import { IsChainAdmin } from "../Store";
import { useMemo, useRef, useState } from "react";
import { Share } from "@capacitor/share";
import { isPlatform } from "@ionic/core";
import { useLongPress } from "use-long-press";

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
  const refAddressPopup = useRef<HTMLIonPopoverElement>(null);
  const refPhoneNumberPopup = useRef<HTMLIonPopoverElement>(null);
  const [isCapacitor] = useState(isPlatform("capacitor"));
  const longPressAddress = useLongPress(
    (e) => {
      refAddressPopup.current?.present(e as any);
    },
    { onCancel: (e) => {} },
  );
  const longPressPhoneNumber = useLongPress(
    (e) => {
      refPhoneNumberPopup.current?.present(e as any);
    },
    { onCancel: (e) => {} },
  );

  function handleCopyPhoneNumber() {
    Clipboard.write({
      string: user.phone_number,
    });
    refPhoneNumberPopup.current?.dismiss();
  }

  function handleSharePhoneNumber() {
    Share.share({
      url: "tel:" + user.phone_number,
    });
    refPhoneNumberPopup.current?.dismiss();
  }

  function handleCopyAddress() {
    Clipboard.write({
      string: user.address,
    });
    refAddressPopup.current?.dismiss();
  }

  function handleShareAddress() {
    Share.share({
      url:
        `https://www.google.com/maps/search/` +
        user.address.replaceAll(" ", "+"),
    });
    refAddressPopup.current?.dismiss();
  }

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
        {isEmailPrivate ? null : (
          <>
            <IonItem lines="none" {...longPressPhoneNumber()}>
              <IonLabel>
                <h3 className="ion-text-bold">{t("phoneNumber")}</h3>
                {user.phone_number ? (
                  <a href={"tel:" + user.phone_number}>{user.phone_number}</a>
                ) : null}
              </IonLabel>
            </IonItem>
            <IonPopover ref={refPhoneNumberPopup}>
              <IonContent>
                <IonList>
                  <IonItem
                    lines="none"
                    className="ion-text-center"
                    button
                    detail={false}
                    onClick={handleCopyPhoneNumber}
                  >
                    {t("copy")}
                    <IonIcon slot="end" size="small" icon={copyOutline} />
                  </IonItem>
                  {isCapacitor ? (
                    <IonItem
                      lines="none"
                      className="ion-text-center"
                      button
                      detail={false}
                      onClick={handleSharePhoneNumber}
                    >
                      {t("share")}
                      <IonIcon slot="end" size="small" icon={shareOutline} />
                    </IonItem>
                  ) : null}
                </IonList>
              </IonContent>
            </IonPopover>
          </>
        )}
        {isAddressPrivate ? null : (
          <>
            <IonItem
              lines="none"
              button
              rel="noreferrer"
              detail={false}
              target="_blank"
              href={
                `https://www.google.com/maps/search/` +
                user.address.replaceAll(" ", "+")
              }
              {...longPressAddress()}
            >
              <IonLabel>
                <h3 className="ion-text-bold">{t("address")}</h3>
                {/* https://www.google.com/maps/@${long},${lat},14z */}
                <p className="ion-text-wrap">{user?.address}</p>
              </IonLabel>
              {user.address ? (
                <IonImg
                  slot="end"
                  style={{ width: 24, height: 24 }}
                  src="/google_maps_logo.svg"
                />
              ) : null}
            </IonItem>
            <IonPopover ref={refAddressPopup}>
              <IonContent>
                <IonList>
                  <IonItem
                    lines="none"
                    className="ion-text-center"
                    button
                    detail={false}
                    target="_blank"
                    href={
                      `https://www.google.com/maps/search/` +
                      user.address.replaceAll(" ", "+")
                    }
                  >
                    {t("open")}
                    <IonIcon slot="end" size="small" icon={compassOutline} />
                  </IonItem>
                  <IonItem
                    lines="none"
                    className="ion-text-center"
                    button
                    detail={false}
                    onClick={handleCopyAddress}
                  >
                    {t("copy")}
                    <IonIcon slot="end" size="small" icon={copyOutline} />
                  </IonItem>
                  {isCapacitor ? (
                    <IonItem
                      lines="none"
                      className="ion-text-center"
                      button
                      detail={false}
                      onClick={handleShareAddress}
                    >
                      {t("share")}
                      <IonIcon slot="end" size="small" icon={shareOutline} />
                    </IonItem>
                  ) : null}
                </IonList>
              </IonContent>
            </IonPopover>
          </>
        )}
      </IonList>
    </div>
  );
}
