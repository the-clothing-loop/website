import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  checkmark,
  checkmarkCircle,
  checkmarkSharp,
  ellipse,
} from "ionicons/icons";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../Store";

export default function Theme(props: { name: string | undefined }) {
  const { t } = useTranslation();
  const { setTheme } = useContext(StoreContext);
  const refModel = useRef<HTMLIonModalElement>(null);
  const [selectedTheme, setSelectedTheme] = useState("default");

  function changeTheme(color: string) {
    setTheme(color);
    refModel.current?.dismiss();
  }

  function modalInit() {
    setSelectedTheme(props.name || "default");
  }
  function didDismiss() {
    setSelectedTheme("default");
  }

  return (
    <IonModal
      ref={refModel}
      trigger="open-modal-theme"
      onIonModalWillPresent={modalInit}
      onIonModalDidDismiss={didDismiss}
      initialBreakpoint={0.25}
      breakpoints={[0, 0.25, 0.5]}
    >
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton color="danger" onClick={() => changeTheme("default")}>
            {t("reset")}
          </IonButton>
        </IonButtons>
        <IonTitle>Theme</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={() => changeTheme(selectedTheme)}>
            {t("change")}
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonContent>
        <IonList>
          <div className="ion-padding ion-text-wrap">
            {COLORS.map((c) => {
              let selected = selectedTheme === c.name;
              return (
                <IonButton
                  fill="clear"
                  size="default"
                  key={c.name}
                  onClick={() => setSelectedTheme(c.name)}
                  className="hover:!tw-opacity-100 tw-group"
                >
                  {c.name === "rainbow" ? (
                    <span className="tw-h-[26px] tw-w-[26px] tw-bg-rainbow-btn tw-rounded-full tw-flex tw-justify-center tw-items-center">
                      <IonIcon
                        icon={checkmarkSharp}
                        style={{ color: "#fff", fontSize: 22 }}
                        aria-label={c.name}
                        className={selected ? "" : "tw-hidden"}
                      />
                    </span>
                  ) : (
                    <IonIcon
                      icon={selected ? checkmarkCircle : ellipse}
                      style={{ color: c.color }}
                      size="large"
                      aria-label={c.name}
                    />
                  )}
                </IonButton>
              );
            })}
          </div>
        </IonList>
      </IonContent>
    </IonModal>
  );
}

const COLORS = [
  { name: "default", color: "#a5a5a5" },
  { name: "leafGreen", color: "#a6c665" },
  { name: "green", color: "#66926e" },
  { name: "teal", color: "#48808b" },
  { name: "yellow", color: "#f4b63f" },
  { name: "orange", color: "#ef953d" },
  { name: "red", color: "#c73643" },
  { name: "pinkLight", color: "#ecbbd0" },
  { name: "pink", color: "#dc77a3" },
  { name: "lilac", color: "#b76dac" },
  { name: "purple", color: "#6c45b0" },
  { name: "skyBlue", color: "#43c6e0" },
  { name: "blueLight", color: "#3f94e4" },
  { name: "blue", color: "#1467b3" },
  {
    name: "rainbow",
    color: "transparent",
  },
];
