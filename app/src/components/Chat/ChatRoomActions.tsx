import { IonActionSheet } from "@ionic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
export function useChatRoomActions(
  onChannelOptionSelect: (_: "rename" | "delete") => void,
) {
  const [isChannelActionSheetOpen, setIsChannelActionSheetOpen] =
    useState(false);

  return {
    isChannelActionSheetOpen,
    setIsChannelActionSheetOpen,
    onChannelOptionSelect,
  };
}

export default function ChatRoomActions({
  isChannelActionSheetOpen,
  setIsChannelActionSheetOpen,
  onChannelOptionSelect,
}: ReturnType<typeof useChatRoomActions>) {
  const { t } = useTranslation();
  return (
    <IonActionSheet
      header={t("chatChannelOptions")}
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
  );
}
