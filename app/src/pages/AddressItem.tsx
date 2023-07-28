import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonPage,
  IonBackButton,
  IonButtons,
  IonFabButton,
  IonImg,
} from "@ionic/react";
import { useContext, useMemo } from "react";
import { RouteComponentProps } from "react-router";
import UserCard from "../components/UserCard";
import { StoreContext } from "../Store";
import isPaused from "../utils/is_paused";

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

export default function AddressItem({
  match,
}: RouteComponentProps<{ uid: string }>) {
  const { chainUsers, chain } = useContext(StoreContext);
  const user = useMemo(() => {
    let userUID = match.params.uid;
    return chainUsers.find((u) => u.uid === userUID) || null;
  }, [match.params.uid, chainUsers]);
  const isUserPaused = isPaused(user?.paused_until || null);

  let phone = user?.phone_number.replaceAll(/[^\d]/g, "") || "";
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/address">Back</IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user ? (
          <UserCard user={user} chain={chain} isUserPaused={isUserPaused} />
        ) : null}
        <div
          style={{ display: "flex" }}
          className="ion-margin-start ion-margin-end ion-margin-top"
        >
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
                }}
              />
            </IonFabButton>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
}
