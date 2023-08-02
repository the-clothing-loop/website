import {
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonImg,
  IonContent,
  IonPopover,
  IonFabButton,
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

interface MessagingApp {
  icon: string;
  link: (n: string) => string;
  name: string;
  color: string;
  colorTint: string;
  colorFade: string;
}
const messagingApps: MessagingApp[] = [
  {
    icon: "/icons/sms.svg",
    link: (n) => `sms:${n}`,
    name: "Sms",
    color: "#44e75f",
    colorTint: "#5dfc77",
    colorFade: "#1dc93a",
  },
  {
    icon: "/icons/whatsapp.svg",
    name: "WhatsApp",
    link: (n) => `https://wa.me/${n}`,
    color: "#25d366",
    colorTint: "#73f793",
    colorFade: "#128c7e",
  },
  {
    icon: "/icons/telegram.svg",
    name: "Telegram",
    link: (n) => `https://t.me/+${n}`,
    color: "#29a9eb",
    colorTint: "#7eb9e1",
    colorFade: "#0f86d7",
  },
  {
    icon: "/icons/signal.svg",
    name: "Signal",
    link: (n) => `https://signal.me/+${n}`,
    color: "#3a76f0",
    colorTint: "#2f6ded",
    colorFade: "#3c3744",
  },
];

export default function UserCard({
  user,
  chain,
  isUserPaused,
  showMessengers = false,
}: {
  user: User;
  chain: Chain | null;
  isUserPaused: boolean;
  showMessengers?: boolean;
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

  let phone = user?.phone_number.replaceAll(/[^\d]/g, "") || "";
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
        {isEmailPrivate && !user.phone_number ? null : (
          <>
            <IonItem
              lines="none"
              button
              rel="noreferrer"
              detail={false}
              target="_blank"
              href={`tel:` + user.phone_number}
              {...longPressPhoneNumber()}
            >
              <IonLabel>
                <h3 className="ion-text-bold">{t("phoneNumber")}</h3>
                <a href={"tel:" + user.phone_number}>{user.phone_number}</a>
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
            {showMessengers ? (
              <div style={{ display: "flex", margin: "8px 16px" }}>
                {messagingApps.map((app) => (
                  <IonFabButton
                    key={app.name}
                    style={{
                      marginInlineEnd: 8,
                      "--background": app.color,
                      "--background-activated": app.colorFade,
                      "--background-focused": app.colorFade,
                      "--background-hover": app.colorTint,
                    }}
                    href={app.link(phone)}
                    target="_blank"
                  >
                    <IonImg
                      src={app.icon}
                      alt={app.name}
                      style={{
                        margin: 12,
                        width: "100%",
                      }}
                    />
                  </IonFabButton>
                ))}
              </div>
            ) : null}
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
