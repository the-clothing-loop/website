import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonRouterLink,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  earth,
  logoFacebook,
  logoInstagram,
  logoLinkedin,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import data from "../data/faq.json";

interface MediaIcon {
  icon: string;
  label: string;
  url: string;
}

const mediaIcons: MediaIcon[] = [
  {
    icon: logoInstagram,
    label: "Instagram",
    url: "https://www.instagram.com/theclothingloop/",
  },
  {
    icon: earth,
    label: "Website",
    url: "https://www.clothingloop.org",
  },
  {
    icon: logoLinkedin,
    label: "LinkedIn",
    url: "https://www.linkedin.com/groups/12746791/",
  },
  {
    icon: logoFacebook,
    label: "Facebook",
    url: "https://www.facebook.com/clothingloop/",
  },
];

export default function HelpList() {
  const { t } = useTranslation();
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("How does it work?")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("How does it work?")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {data.map((item, index) => (
            <IonItem routerLink={"/help/" + index} lines="full" key={index}>
              {item.Title}
            </IonItem>
          ))}
        </IonList>
        <div
          className="ion-margin-top"
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {mediaIcons.map((mi) => (
            <IonRouterLink
              rel="noreferrer"
              target="_blank"
              href={mi.url}
              key={mi.label}
              className="ion-margin"
            >
              <IonIcon
                color="dark"
                size="large"
                icon={mi.icon}
                aria-label={mi.label}
              />
            </IonRouterLink>
          ))}
        </div>
        <IonRouterLink
          className="ion-text-center"
          aria-label="Email"
          href="mailto:hello@clothingloop.org"
          style={{
            display: "block",
            color: "var(--ion-color-primary)",
            fontSize: "14px",
          }}
        >
          hello@clothingloop.org
        </IonRouterLink>
      </IonContent>
    </IonPage>
  );
}
