import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { checkmarkCircle, ellipse } from "ionicons/icons";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../Store";

export default function Theme(props: { color: string | null }) {
  const { t } = useTranslation();
  const { chain } = useContext(StoreContext);

  function setTheme(color: string) {}

  return (
    <IonModal
      trigger="open-modal-theme"
      initialBreakpoint={0.25}
      breakpoints={[0, 0.25, 0.5]}
    >
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton color="danger">{t("reset")}</IonButton>
        </IonButtons>
        <IonTitle>Theme</IonTitle>
        <IonButtons slot="end">
          <IonButton>{t("submit")}</IonButton>
        </IonButtons>
      </IonToolbar>
      <IonContent>
        <IonList>
          <div className="ion-padding tw-flex tw-flex-wrap tw-gap-4">
            {COLORS.map((c) => {
              let selected = c.color === props.color;
              return (
                <IonIcon
                  icon={selected ? checkmarkCircle : ellipse}
                  style={{ color: c.color }}
                  size="large"
                  aria-label={c.name}
                  className=""
                />
              );
            })}
          </div>
        </IonList>
      </IonContent>
    </IonModal>
  );
}

const COLORS = [
  { name: "leafGreenLight", color: "#d2e2b3" },
  { name: "leafGreen", color: "#a6c665" },
  { name: "greenLight", color: "#b1c8b6" },
  { name: "green", color: "#66926e" },
  { name: "dark green", color: "#518d7e" },
  { name: "yellow", color: "#f4b63f" },
  { name: "orangeLight", color: "#f6c99f" },
  { name: "orange", color: "#ef953d" },
  { name: "redLight", color: "#e39aa1" },
  { name: "red", color: "#c73643" },
  { name: "pinkLight", color: "#ecbbd0" },
  { name: "pink", color: "#dc77a3" },
  { name: "lilacLight", color: "#dab5d6" },
  { name: "lilac", color: "#b76dac" },
  { name: "purpleLighter", color: "#EADEFF" },
  { name: "purple", color: "#a899c2" },
  { name: "skyBlue", color: "#7ecfe0" },
  { name: "light blue", color: "#89b3d9" },
  { name: "blue", color: "#1467b3" },
];
