import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
  IonIcon,
  useIonAlert,
} from "@ionic/react";
import { Channel } from "@mattermost/types/channels";
import { t } from "i18next";
import { checkmarkCircle, ellipse } from "ionicons/icons";
import { useRef, useState } from "react";

const channelColors = [
  "#C9843E",
  "#AD8F22",
  "#79A02D",
  "#66926E",
  "#199FBA",
  "#6494C2",
  "#1467B3",
  "#A899C2",
  "#513484",
  "#B37EAD",
  "#B76DAC",
  "#F57BB0",
  "#A35C7B",
  "#E38C95",
  "#C73643",
  "#7D7D7D",
  "#3C3C3B",
];

export function useChatCreateEdit(props: {
  onDeleteChannel: (id: string) => void;
  selectedChannel: Channel | null;
}) {
  const [presentAlert] = useIonAlert();
  const modal = useRef<HTMLIonModalElement>(null);
  const [channelName, setChannelName] = useState("");
  const [channelEdit, setChannelEdit] = useState<null | Channel>(null);
  const [channelColor, setChannelColor] = useState(channelColors[2]);

  function onChannelOptionSelect(value: "delete" | "rename") {
    if (value == "delete") {
      const handler = () => {
        props.onDeleteChannel(props.selectedChannel!.id);
      };
      presentAlert({
        header: "Delete chat room?",
        buttons: [
          {
            text: t("cancel"),
          },
          {
            role: "destructive",
            text: t("delete"),
            handler,
          },
        ],
      });
    } else if (value == "rename") {
      setChannelColor(props.selectedChannel!.header || "#fff");
      setChannelName(props.selectedChannel!.display_name);
      setChannelEdit(props.selectedChannel);
      setTimeout(() => {
        modal.current?.present();
      });
    }
  }
  function onOpenCreateChannel() {
    setChannelColor("#fff");
    setChannelName("");
    setChannelEdit(null);
    setTimeout(() => {
      modal.current?.present();
    });
  }

  return {
    modal,
    channelName,
    setChannelName,
    channelId: channelEdit,
    setChannelId: setChannelEdit,
    channelColor,
    setChannelColor,
    onChannelOptionSelect,
    onOpenCreateChannel,
  };
}

type Props = ReturnType<typeof useChatCreateEdit> & {
  onRenameChannel: (channel: Channel, name: string, color: string) => void;
  onCreateChannel: (name: string, color: string) => void;
};

export default function ChatCreateEdit({
  modal,
  channelName,
  setChannelName,
  channelId,
  onRenameChannel,
  onCreateChannel,
  channelColor,
  setChannelColor,
}: Props) {
  function cancel() {
    modal.current?.dismiss();
  }
  function onCreateEditChannelSubmit() {
    if (channelId) {
      onRenameChannel(channelId, channelName, channelColor);
    } else {
      onCreateChannel(channelName, channelColor);
    }
    modal.current?.dismiss();
  }

  return (
    <IonModal ref={modal}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancel}>{t("cancel")}</IonButton>
          </IonButtons>
          <IonTitle>{channelId ? t("editRoom") : t("createRoom")}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onCreateEditChannelSubmit}>
              {channelId ? t("edit") : t("create")}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem lines="none">
            <IonInput
              type="text"
              label={t("roomName")}
              labelPlacement="start"
              max={18}
              spellCheck
              autoCapitalize="words"
              maxlength={18}
              counter
              placeholder={t("roomName")}
              onFocus={(e) => (e.target as any as HTMLInputElement).select()}
              value={channelName}
              onIonInput={(e) =>
                setChannelName(e.detail.value?.toString() || "")
              }
            />
          </IonItem>
          <IonItem lines="none">
            <IonLabel>
              {t("roomColor")}
              <div className="tw-grid tw-grid-cols-[repeat(auto-fill,75px)] tw-justify-center">
                {channelColors.map((c) => {
                  const selected = c === channelColor;
                  return (
                    <IonButton
                      fill="clear"
                      size="default"
                      key={c}
                      onClick={() => setChannelColor(c)}
                      className="hover:!tw-opacity-100 tw-group"
                    >
                      <IonIcon
                        icon={selected ? checkmarkCircle : ellipse}
                        style={{ color: c }}
                        size="large"
                        className="tw-border-2 tw-border-solid tw-border-transparent tw-rounded-full group-hover:tw-border-medium group-active:tw-border-primary"
                      />
                    </IonButton>
                  );
                })}
              </div>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
