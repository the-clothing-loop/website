import { Client4 } from "@mattermost/client";
import { MmData } from "../../stores/Store";
import ChatInput, { SendingMsgState } from "./ChatInput";
import { Channel } from "@mattermost/types/channels";
import {
  IonActionSheet,
  IonAlert,
  IonIcon,
  useIonAlert,
} from "@ionic/react";
import {
  addOutline
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { IonAlertCustomEvent, SelectChangeEventDetail } from "@ionic/core";
import { PostList } from "@mattermost/types/posts";
import { User } from "../../api/types";
import ChatPost from "./ChatPost";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useLongPress } from "use-long-press";
import { c } from "vitest/dist/reporters-5f784f42";

interface Props {
  channels: Channel[];
  selectedChannel: Channel | null;
  postList: PostList;
  authUser: User;
  onCreateChannel: (n: string) => void;
  onSelectChannel: (c: Channel) => void;
  onRenameChannel: (n: string) => void;
  onDeleteChannel: () => void;
  onScrollTop: (topPostId: string) => void;
  onSendMessage: (msg: string, callback: Function) => Promise<void>;
}

// This follows the controller / view component pattern
export default function ChatWindow(props: Props) {
  const { t } = useTranslation();
  const slowTriggerScrollTop = useDebouncedCallback(() => {
    const lastPostId = props.postList.order.at(-1);
    if (lastPostId) {
      console.log("last post", lastPostId);
      props.onScrollTop(lastPostId);
    }
  }, 1000);
  const refScrollRoot = useRef<HTMLDivElement>(null);
  const [refScrollTop, entry] = useIntersectionObserver({
    root: refScrollRoot.current,
  });

  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    if (entry?.isIntersecting) {
      console.log("Intersecting");
      slowTriggerScrollTop();
    }
  }, [entry?.isIntersecting]);

  function onCreateChannelSubmit(e: IonAlertCustomEvent<any>) {
    if (e?.detail?.role === "submit" && e.detail?.data?.values?.name) {
      props.onCreateChannel(e.detail.data.values.name);
    }
  }

  function onRenameChannelSubmit(name: string) {
    props.onRenameChannel(name);
  }

  function onDeleteChannelSubmit() {
    if (props.selectedChannel) props.onDeleteChannel();
  }

  function onSendMessageWithCallback(topPostId: string) {
    return props.onSendMessage(topPostId, () => {
      refScrollRoot.current?.scrollTo({
        top: 0,
      });
    });
  }

  const longPressChannel = useLongPress(
    (e) => {
      setIsActionSheetOpen(true);
    },
    {
      onCancel: (e) => {
        setIsActionSheetOpen(false);
      },
    },
  );

  function handleOptionSelect(value: string) {
    if (value == "delete") {
      const handler = () => {
        onDeleteChannelSubmit();
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
      const handler = (newChannelName: string) => {
        onRenameChannelSubmit(newChannelName);
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
            placeholder: props.selectedChannel?.name,
            name: "newChannelName",
          },
        ],
      });
    }
  }

  return (
    <div className="tw-relative tw-h-full tw-flex tw-flex-col">
      <div className="tw-shrink-0 w-full tw-flex tw-px-2 tw-gap-1 tw-overflow-y-auto tw-bg-[#f4f1f9]">
        {props.channels?.map((cr, i) => {
          const initials = cr.display_name
            .split(" ")
            .map((word) => word[0])
            .join("");
          const isSelected = cr.id === props.selectedChannel?.id;
          return (
            <div>
              {isSelected ? (
                <button
                  className="tw-p-2 tw-flex tw-flex-col tw-items-center tw-bg-light"
                  key={cr.id}
                  {...longPressChannel(isSelected)}
                >
                  <div className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-purple-shade  tw-flex tw-items-center tw-justify-center tw-ring tw-ring-transparent group-hover:tw-ring-purple tw-transition-colors">
                    {initials}
                  </div>
                  <div className="tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem] tw-font-bold">
                    {cr.display_name}
                  </div>
                </button>
              ) : (
                <button
                  className="tw-p-2 tw-flex tw-flex-col tw-items-center tw-group"
                  key={cr.id}
                  onClick={() => props.onSelectChannel(cr)}
                >
                  <div className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-purple-shade tw-flex tw-items-center tw-justify-center tw-ring tw-ring-transparent group-hover:tw-ring-purple tw-transition-colors">
                    {initials}
                  </div>
                  <div className="tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem]">
                    {cr.display_name}
                  </div>
                </button>
              )}
            </div>
          );
        })}
        <IonActionSheet
          header={t("chatRoomOptions")}
          isOpen={isActionSheetOpen}
          onDidDismiss={() => setIsActionSheetOpen(false)}
          buttons={[
            {
              text: "Rename",
              handler: () => handleOptionSelect("rename"),
            },
            {
              text: "Delete",
              handler: () => handleOptionSelect("delete"),
            },
            {
              text: "Cancel",
              role: "cancel",
            },
          ]}
        ></IonActionSheet>
        <div key="plus" className="tw-p-2 tw-me-4 tw-flex tw-shrink-0">
          <button
            id="create_channel_btn"
            className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-light-shade hover:tw-bg-purple-contrast tw-flex tw-items-center tw-justify-center"
          >
            <IonIcon className="tw-text-2xl" src={addOutline} />
          </button>
        </div>
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
      <div
        ref={refScrollRoot}
        className="tw-flex-grow tw-flex tw-flex-col-reverse tw-overflow-y-auto"
      >
        {props.postList.order.map((item, i) => {
          const post = props.postList.posts[item];
          const isMe = post.user_id === props.authUser.uid;
          return <ChatPost post={post} key={post.id} isMe={isMe} />;
          // return <span>{post.id}</span>;
        })}
        <span key="top" ref={refScrollTop}></span>
      </div>
      <ChatInput onSendMessage={onSendMessageWithCallback} />
    </div>
  );
}
