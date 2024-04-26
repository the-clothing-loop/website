import { Client4 } from "@mattermost/client";
import { MmData } from "../../stores/Store";
import ChatInput, { SendingMsgState } from "./ChatInput";
import { Channel } from "@mattermost/types/channels";
import {
  IonAlert,
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
  IonPopover,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  addOutline,
  compassOutline,
  copyOutline,
  refreshOutline,
  shareOutline,
  text,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { IonAlertCustomEvent } from "@ionic/core";
import { PostList } from "@mattermost/types/posts";
import { User } from "../../api/types";
import ChatPost from "./ChatPost";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useLongPress } from "use-long-press";

interface Props {
  channels: Channel[];
  selectedChannel: Channel | null;
  postList: PostList;
  authUser: User;
  onCreateChannel: (n: string) => void;
  onSelectChannel: (c: Channel) => void;
  onUpdateChannelName: (n: string) => void;
  onDeleteChannel: (n: string) => void;
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
  const refChannelOptions = useRef<HTMLIonModalElement>(null);
  const [modalState, setModalState] = useState("default");

  const [channelName, setChannelName] = useState(props.selectedChannel?.name);

  console.log("channelName: ", props.selectedChannel?.name, channelName);

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

  function onUpdateChannelName() {
    console.log("inside update channel name in chatwindow");
    if (channelName) props.onUpdateChannelName(channelName);
    refChannelOptions.current?.dismiss();
    setModalState("default");
  }

  function onDeleteChannel() {
    console.log("inside delete channel  in chatwindow");
    if (channelName) props.onDeleteChannel(channelName);
    refChannelOptions.current?.dismiss();
    setModalState("default");
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
      refChannelOptions.current?.present();
    },
    { onCancel: (e) => {} },
  );

  function handleCloseModal() {
    setModalState("default");
    refChannelOptions.current?.dismiss();
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
              <button
                className={"tw-p-2 tw-flex tw-flex-col tw-items-center".concat(
                  isSelected ? " tw-bg-light" : " tw-group",
                )}
                key={cr.id}
                onClick={
                  isSelected ? undefined : () => props.onSelectChannel(cr)
                }
                {...longPressChannel()}
              >
                <div className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-purple-shade  tw-flex tw-items-center tw-justify-center tw-ring tw-ring-transparent group-hover:tw-ring-purple tw-transition-colors">
                  {initials}
                </div>
                <div
                  className={"tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem]".concat(
                    isSelected ? " tw-font-bold" : "",
                  )}
                >
                  {cr.display_name}
                </div>
              </button>

              <IonModal
                ref={refChannelOptions}
                initialBreakpoint={0.25}
                breakpoints={[0, 0.5, 0.75, 1]}
              >
                <IonHeader>
                  <IonToolbar>
                    {modalState != "default" ? (
                    <IonButtons slot="start">
                      <IonButton onClick={() => setModalState("default")}>
                        {t("back")}
                      </IonButton>
                    </IonButtons>): null}
                    <IonButtons slot="end">
                      <IonButton onClick={handleCloseModal}>
                        {t("close")}
                      </IonButton>
                    </IonButtons>
                    <IonTitle>{modalState}</IonTitle>
                  </IonToolbar>
                </IonHeader>

                {modalState == "rename" ? (
                  <IonContent>
                    <IonItem>
                      <IonInput
                        label="Enter New Channel Name"
                        value={channelName}
                        labelPlacement="stacked"
                        onIonInput={(e) =>
                          setChannelName(e.detail.value?.toString() || "")
                        }
                      ></IonInput>
                    </IonItem>
                    <IonItem lines="none">
                      <IonButtons slot="end">
                        <IonButton onClick={onUpdateChannelName} size="default">
                          {t("Rename")}
                        </IonButton>
                      </IonButtons>
                    </IonItem>
                  </IonContent>
                ) : modalState == "delete" ? (
                  <IonContent>
                    <IonItem lines="none">
                      Are you sure you want to delete channel?
                    </IonItem>
                    <IonItem lines="none">
                      <IonButtons slot="end">
                        <IonButton
                          onClick={onDeleteChannel}
                          color="danger"
                          size="default"
                        >
                          {t("delete")}
                        </IonButton>
                      </IonButtons>
                    </IonItem>
                  </IonContent>
                ) : (
                  <IonContent>
                    <IonList>
                      <IonItem onClick={() => setModalState("rename")} >
                        Rename Channel
                      </IonItem>
                      <IonItem onClick={() => setModalState("delete")} >
                        Delete Channel
                      </IonItem>
                    </IonList>
                  </IonContent>
                )}
              </IonModal>
            </div>
          );
        })}
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
