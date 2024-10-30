import { IonActionSheet, IonIcon } from "@ionic/react";
import { Channel } from "@mattermost/types/channels";
import { useRef, useState } from "react";
import { useLongPress } from "use-long-press";
import { addOutline, build as buildFilled } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { readableColor } from "color2k";

interface Props {
  chainChannels: Channel[];
  selectedChannel: Channel | null;
  isChainAdmin: boolean;
  onSelectChannel: (cr: Channel) => void;
  onOpenCreateChannel: () => void;
  selectedOldBulkyItems: boolean;
  onSelectOldBulkyItems: () => void;
  onChannelOptionSelect: (value: "delete" | "rename") => void;
}

export default function ChatRoomSelect({
  chainChannels,
  selectedChannel,
  isChainAdmin,
  onSelectChannel,
  selectedOldBulkyItems,
  onSelectOldBulkyItems,
  onChannelOptionSelect,
  onOpenCreateChannel,
}: Props) {
  const { t } = useTranslation();
  const [isChannelActionSheetOpen, setIsChannelActionSheetOpen] =
    useState(false);
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

  return (
    <div className="tw-shrink-0 w-full tw-flex tw-px-2 tw-gap-1 tw-overflow-x-auto tw-bg-purple-shade">
      <button
        className={"tw-p-2 tw-flex tw-flex-col tw-items-center tw-group".concat(
          selectedOldBulkyItems ? " tw-bg-[#fff]/20" : "",
        )}
        key="oldBulkyItems"
        onClick={onSelectOldBulkyItems}
      >
        <div
          className={"tw-relative tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-blue-tint tw-flex tw-items-center tw-justify-center tw-ring group-hover:tw-ring-blue tw-transition-colors".concat(
            selectedOldBulkyItems
              ? " tw-ring-blue tw-ring-1"
              : " tw-ring-transparent",
          )}
        >
          <span>B</span>
        </div>
        <div
          className={"tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem]".concat(
            selectedOldBulkyItems ? " tw-font-bold" : "",
          )}
        >
          {t("bulkyItems")}
        </div>
      </button>
      {chainChannels.map((cr, i) => {
        const initials = cr.display_name
          .split(" ")
          .map((word) => word[0])
          .join("");

        const isSelected = cr.id === selectedChannel?.id;

        const textColor = readableColor(cr.header || "#fff");
        return (
          <button
            className={"tw-p-2 tw-flex tw-flex-col tw-items-center tw-group".concat(
              isSelected ? " tw-bg-[#fff]/20" : "",
            )}
            key={cr.id}
            {...(isSelected
              ? isChainAdmin
                ? longPressChannel(isSelected)
                : {}
              : {
                  onClick: () => onSelectChannel(cr),
                })}
          >
            <div
              style={{ backgroundColor: cr.header || "#fff" }}
              className={"tw-relative tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ring  group-hover:tw-ring-purple tw-transition-colors".concat(
                isSelected
                  ? " tw-ring-purple tw-ring-1"
                  : " tw-ring-transparent",
              )}
            >
              <span style={{ color: textColor }}>{initials}</span>
              {isSelected && isChainAdmin ? (
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
              {cr.display_name!}
            </div>
          </button>
        );
      })}

      <IonActionSheet
        header={t("chatRoomOptions")}
        key="actionSheet"
        isOpen={isChannelActionSheetOpen}
        onDidDismiss={() => setIsChannelActionSheetOpen(false)}
        buttons={[
          {
            text: t("rename"),
            handler: () => onChannelOptionSelect("rename"),
          },
          {
            text: t("delete"),
            role: "destructive",
            handler: () => onChannelOptionSelect("delete"),
          },
          {
            text: t("cancel"),
            role: "cancel",
          },
        ]}
      ></IonActionSheet>

      {isChainAdmin ? (
        <div key="plus" className="tw-p-2 tw-me-4 tw-flex tw-shrink-0">
          <button
            onClick={onOpenCreateChannel}
            className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-light-shade hover:tw-bg-purple-contrast tw-flex tw-items-center tw-justify-center"
          >
            <IonIcon className="tw-text-2xl" src={addOutline} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
