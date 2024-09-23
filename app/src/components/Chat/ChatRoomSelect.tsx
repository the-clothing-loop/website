import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { Channel } from "@mattermost/types/channels";
import { useRef, useState } from "react";
import { useLongPress } from "use-long-press";
import {
  addOutline,
  bag,
  build as buildFilled,
  checkmarkCircle,
  ellipse,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { IonAlertCustomEvent } from "@ionic/core";
import { UserGroup } from "@heroiclabs/nakama-js";
import { readableColor } from "color2k";

interface Props {
  chainChannels: UserGroup[];
  selectedChannel: UserGroup | null;
  isChainAdmin: boolean;
  onSelectChannel: (cr: UserGroup) => void;
  onCreateChannel: (name: string, color: string) => void;
  onDeleteChannelSubmit: () => void;
  onRenameChannelSubmit: (name: string) => void;
  selectedOldBulkyItems: boolean;
  onSelectOldBulkyItems: () => void;
}

export default function ChatRoomSelect(props: Props) {
  const { t } = useTranslation();
  const [isChannelActionSheetOpen, setIsChannelActionSheetOpen] =
    useState(false);
  const [presentAlert] = useIonAlert();
  const longPressChannel = useLongPress(
    (e) => {
      setIsChannelActionSheetOpen(true);
    },
    {
      onCancel: (e) => {
        setIsChannelActionSheetOpen(false);
      },
    },
  );
  const modal = useRef<HTMLIonModalElement>(null);
  const [channelName, setChannelName] = useState("");

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
  const [channelColor, setChannelColor] = useState(channelColors[2]);

  function onCreateChannelSubmit() {
    props.onCreateChannel(channelName, channelColor);
    modal.current?.dismiss();
  }
  function cancel() {
    modal.current?.dismiss();
  }
  function handleChannelOptionSelect(value: "delete" | "rename") {
    if (value == "delete") {
      const handler = () => {
        props.onDeleteChannelSubmit();
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
      const handler = (e: { newChannelName: string }) => {
        props.onRenameChannelSubmit(e.newChannelName);
      };
      presentAlert({
        header: "Rename chat room?",
        buttons: [
          {
            text: t("cancel"),
          },
          {
            role: "submit",
            text: t("submit"),
            handler,
          },
        ],
        inputs: [
          {
            placeholder: props.selectedChannel?.group!.description!,
            name: "newChannelName",
          },
        ],
      });
    }
  }

  return (
    <div className="tw-shrink-0 w-full tw-flex tw-px-2 tw-gap-1 tw-overflow-x-auto tw-bg-purple-shade">
      {props.chainChannels.map((cr, i) => {
        const initials = cr
          .group!.description!.split(" ")
          .map((word) => word[0])
          .join("");

        const isSelected = cr.group!.id === props.selectedChannel?.group!.id;

        const textColor = readableColor(cr.group!.avatar_url || "#fff");
        return (
          <button
            className={"tw-p-2 tw-flex tw-flex-col tw-items-center tw-group".concat(
              isSelected ? " tw-bg-[#fff]/20" : "",
            )}
            key={cr.group!.id}
            {...(isSelected
              ? props.isChainAdmin
                ? longPressChannel(isSelected)
                : {}
              : {
                  onClick: () => props.onSelectChannel(cr),
                })}
          >
            <div
              style={{ backgroundColor: cr.group!.avatar_url || "#fff" }}
              className={"tw-relative tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ring  group-hover:tw-ring-purple tw-transition-colors".concat(
                isSelected
                  ? " tw-ring-purple tw-ring-1"
                  : " tw-ring-transparent",
              )}
            >
              <span style={{ color: textColor }}>{initials}</span>
              {isSelected && props.isChainAdmin ? (
                <div className="tw-absolute tw-bottom-0 tw-right-0 tw-bg-light-shade tw-z-10 tw-w-6 tw-h-6 tw-rounded-full -tw-m-1 tw-flex tw-justify-center tw-items-center">
                  <IonIcon icon={buildFilled} size="xs" color="dark" />
                </div>
              ) : null}
            </div>
            <div
              className={"tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem]".concat(
                isSelected ? " tw-font-bold" : "",
              )}
            >
              {cr.group!.description!}
            </div>
          </button>
        );
      })}
      <button
        className={"tw-p-2 tw-flex tw-flex-col tw-items-center tw-group".concat(
          props.selectedOldBulkyItems ? " tw-bg-[#fff]/20" : "",
        )}
        key="oldBulkyItems"
        onClick={props.onSelectOldBulkyItems}
      >
        <div
          className={"tw-relative tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-blue-tint tw-flex tw-items-center tw-justify-center tw-ring group-hover:tw-ring-blue tw-transition-colors".concat(
            props.selectedOldBulkyItems
              ? " tw-ring-blue tw-ring-1"
              : " tw-ring-transparent",
          )}
        >
          <span>B</span>
        </div>
        <div
          className={"tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem]".concat(
            props.selectedOldBulkyItems ? " tw-font-bold" : "",
          )}
        >
          {t("bulkyItems")}
        </div>
      </button>
      <IonActionSheet
        header={t("chatRoomOptions")}
        key="actionSheet"
        isOpen={isChannelActionSheetOpen}
        onDidDismiss={() => setIsChannelActionSheetOpen(false)}
        buttons={[
          {
            text: t("rename"),
            handler: () => handleChannelOptionSelect("rename"),
          },
          {
            text: t("delete"),
            role: "destructive",
            handler: () => handleChannelOptionSelect("delete"),
          },
          {
            text: t("cancel"),
            role: "cancel",
          },
        ]}
      ></IonActionSheet>

      {props.isChainAdmin ? (
        <div key="plus" className="tw-p-2 tw-me-4 tw-flex tw-shrink-0">
          <button
            id="create_channel_btn"
            className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-light-shade hover:tw-bg-purple-contrast tw-flex tw-items-center tw-justify-center"
          >
            <IonIcon className="tw-text-2xl" src={addOutline} />
          </button>
        </div>
      ) : null}
      <IonModal ref={modal} trigger="create_channel_btn">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={cancel}>{t("cancel")}</IonButton>
            </IonButtons>
            <IonTitle>{t("createRoom")}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onCreateChannelSubmit}>
                {t("Create")}
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
    </div>
  );
}
