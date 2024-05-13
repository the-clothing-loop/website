import { Client4 } from "@mattermost/client";
import { IsChainAdmin, MmData, StoreContext } from "../../stores/Store";
import ChatInput, { SendingMsgState } from "./ChatInput";
import { Channel } from "@mattermost/types/channels";
import { IonActionSheet, IonAlert, IonIcon, useIonAlert } from "@ionic/react";
import { addOutline, build as buildFilled } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { IonAlertCustomEvent } from "@ionic/core";
import { PostList } from "@mattermost/types/posts";
import { User } from "../../api/types";
import ChatPost from "./ChatPost";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useLongPress } from "use-long-press";

interface Props {
  channels: Channel[];
  selectedChannel: Channel | null;
  postList: PostList;
  authUser: User;
  onCreateChannel: (n: string) => void;
  onSelectChannel: (c: Channel) => void;
  onRenameChannel: (c: Channel, n: string) => void;
  onDeleteChannel: (id: string) => void;
  onScrollTop: (topPostId: string) => void;
  onSendMessage: (msg: string, callback: Function) => Promise<void>;
}

// This follows the controller / view component pattern
export default function ChatWindow(props: Props) {
  const { t } = useTranslation();
  const { isChainAdmin, chain, chainUsers } = useContext(StoreContext);
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

  const chainChannels = useMemo(() => {
    if (!chain || !chain.chat_room_ids) return [];
    console.log("chainChannels", props.channels);
    return props.channels
      .filter((c) => chain.chat_room_ids?.includes(c.id))
      .sort((a, b) => (a.create_at > b.create_at ? 1 : 0));
  }, [props.channels, chain]);

  function onCreateChannelSubmit(e: IonAlertCustomEvent<any>) {
    if (e?.detail?.role === "submit" && e.detail?.data?.values?.name) {
      props.onCreateChannel(e.detail.data.values.name);
    }
  }

  function onRenameChannelSubmit(name: string) {
    if (!props.selectedChannel) return;
    props.onRenameChannel(props.selectedChannel, name);
  }

  function onDeleteChannelSubmit() {
    if (!props.selectedChannel) return;
    if (props.selectedChannel) props.onDeleteChannel(props.selectedChannel.id);
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
      const handler = (e: { newChannelName: string }) => {
        onRenameChannelSubmit(e.newChannelName);
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
    <div className="tw-relative tw-h-full tw-flex tw-flex-col">
      <div className="tw-shrink-0 w-full tw-flex tw-px-2 tw-gap-1 tw-overflow-y-auto tw-bg-[#f4f1f9]">
        {chainChannels.map((cr, i) => {
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
                ? isChainAdmin
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
                {cr.display_name}
              </div>
            </button>
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
          const prevPostID = props.postList.order.at(i - 1);
          const prevPost = prevPostID ? props.postList.posts[prevPostID] : null;
          const isMe = post.user_id === props.authUser.uid;
          return (
            <ChatPost
              post={post}
              prevPost={prevPost}
              key={post.id}
              isMe={isMe}
              users={chainUsers}
            />
          );
          // return <span>{post.id}</span>;
        })}
        <span key="top" ref={refScrollTop}></span>
      </div>
      <ChatInput onSendMessage={onSendMessageWithCallback} />
    </div>
  );
}
