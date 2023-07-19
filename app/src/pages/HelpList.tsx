import {
  IonButton,
  IonButtons,
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
  // mail,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../Store";
import { useContext, useMemo, useRef } from "react";
import CreateUpdateRules from "../components/CreateUpdateRules";
import { FaqListItem } from "./HelpItem";

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
  // {
  //   icon: mail,
  //   label: "Email",
  //   url: "mailto:hello@clothingloop.org",
  // },
  {
    icon: logoLinkedin,
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/the-clothing-loop/",
  },
  {
    icon: logoFacebook,
    label: "Facebook",
    url: "https://www.facebook.com/clothingloop/",
  },
];

export default function HelpList() {
  const { t } = useTranslation();
  const { authUser, chain, setChain } = useContext(StoreContext);
  const modal = useRef<HTMLIonModalElement>(null);

  const isUserAdmin = useMemo(
    () =>
      authUser && chain
        ? authUser?.chains.find((uc) => uc.chain_uid === chain.uid)
            ?.is_chain_admin || false
        : false,
    [authUser, chain],
  );

  const data = t("list", { ns: "faq", returnObjects: true }) as FaqListItem[];
  const rules = useMemo(() => {
    if (chain?.rules_override) {
      return JSON.parse(chain.rules_override) as FaqListItem[];
    }
    return data;
  }, [chain]);

  function handleClickChange() {
    modal.current?.present();
  }

  function refreshChain() {
    setChain(chain, authUser!.uid);
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{t("howDoesItWork")}</IonTitle>

          {isUserAdmin ? (
            <IonButtons slot="end">
              <IonButton onClick={handleClickChange}>{t("change")}</IonButton>
            </IonButtons>
          ) : null}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{t("howDoesItWork")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {rules.map((item, index) => (
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

        <CreateUpdateRules
          rules={chain?.rules_override || null}
          modal={modal}
          didDismiss={refreshChain}
        />
      </IonContent>
    </IonPage>
  );
}
