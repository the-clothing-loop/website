import { IonActionSheet, IonAlert, IonIcon, useIonAlert } from "@ionic/react";
import { Channel } from "@mattermost/types/channels";
import { useState } from "react";
import { useLongPress } from "use-long-press";
import { addOutline, build as buildFilled } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { IonAlertCustomEvent } from "@ionic/core";

interface Props {
  chainChannels: Channel[];
  selectedChannel: Channel | null;
  isChainAdmin: boolean;
  onSelectChannel: (cr: Channel) => void;
  onCreateChannel: (name: string) => void;
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

  function onCreateChannelSubmit(e: IonAlertCustomEvent<any>) {
    if (e?.detail?.role === "submit" && e.detail?.data?.values?.name) {
      props.onCreateChannel(e.detail.data.values.name);
    }
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
            placeholder: props.selectedChannel?.display_name,
            name: "newChannelName",
          },
        ],
      });
    }
  }

  return (
    <div className="tw-shrink-0 w-full tw-flex tw-px-2 tw-gap-1 tw-overflow-x-auto tw-bg-[#f4f1f9]">
      {props.chainChannels.map((cr, i) => {
        const initials = cr.display_name
          .split(" ")
          .map((word) => word[0])
          .join("");
        const isSelected = cr.id === props.selectedChannel?.id;
        return (
          <button
            className={"tw-p-2 tw-flex tw-flex-col tw-items-center tw-group".concat(
              isSelected ? " tw-bg-light" : "",
            )}
            key={cr.id}
            {...(isSelected
              ? props.isChainAdmin
                ? longPressChannel(isSelected)
                : {}
              : {
                  onClick: () => props.onSelectChannel(cr),
                })}
          >
            <div
              className={"tw-relative tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-purple-shade tw-flex tw-items-center tw-justify-center tw-ring  group-hover:tw-ring-purple tw-transition-colors".concat(
                isSelected
                  ? " tw-ring-purple tw-ring-1"
                  : " tw-ring-transparent",
              )}
            >
              <span>{initials}</span>
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
              {cr.display_name}
            </div>
          </button>
        );
      })}
      <button
        className={"tw-p-2 tw-flex tw-flex-col tw-items-center tw-group".concat(
          props.selectedOldBulkyItems ? " tw-bg-light" : "",
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
      <IonAlert
        onIonAlertDidDismiss={onCreateChannelSubmit}
        trigger="create_channel_btn"
        header="Create a chat room"
        buttons={[
          { text: t("cancel"), role: "cancel" },
          { text: t("create"), role: "submit" },
        ]}
        inputs={[
          {
            placeholder: t("name"),
            name: "name",
            min: 1,
          },
        ]}
      ></IonAlert>
    </div>
  );
}
