import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { StoreContext } from "../stores/Store";
import { useContext, useEffect, useRef, useState } from "react";
import * as apiChat from "../api/chat";
import { Client4, WebSocketMessage } from "@mattermost/client";
import { PaginatedPostList, Post } from "@mattermost/types/posts";
import RoomNotReady from "../components/Chat/RoomNotReady";
import { Channel } from "@mattermost/types/channels";
import Loading from "../components/PrivateRoute/Loading";
import { UserProfile } from "@mattermost/types/users";
import { ChatContext } from "../stores/Chat";
import ChatRoomSelect from "../components/Chat/ChatRoomSelect";
import ChatCreateEdit, {
  useChatCreateEdit,
} from "../components/Chat/ChatCreateEdit";
import ChatInput from "../components/Chat/ChatInput";
import ChatPost from "../components/Chat/ChatPost";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useDebouncedCallback } from "use-debounce";
import ChatRoomActions, {
  useChatRoomActions,
} from "../components/Chat/ChatRoomActions";
import ChatPostList from "../components/Chat/ChatPostList";
import BulkyList from "../components/Chat/BulkyList";

const VITE_CHAT_URL = import.meta.env.VITE_CHAT_URL;

export type OnSendMessageWithImage = (
  message: string,
  file: File,
) => Promise<void>;

type WebSocketMessagePosted = WebSocketMessage<{
  channel_display_name: string;
  channel_name: string;
  channel_type: string;
  post: string;
  sender_name: string;
  team_id: string;
  set_online: true;
}>;

// This follows the controller / view component pattern
export default function Chat() {
  const { t } = useTranslation();
  const { chain, setChain, isThemeDefault } = useContext(StoreContext);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedOldBulkyItems, setSelectedOldBulkyItems] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [mmUser, setMmUser] = useState<Record<string, UserProfile>>({});
  const [postList, setPostList] = useState<PaginatedPostList>({
    order: [],
    posts: {},
    next_post_id: "",
    prev_post_id: "",
    first_inaccessible_post_time: 0,
    has_next: true,
  });
  const [loadingPostList, setLoadingPostList] = useState(false);
  const { authUser, chainUsers, isChainAdmin } = useContext(StoreContext);
  const ChatStore = useContext(ChatContext);
  const UseChatCreateEdit = useChatCreateEdit({
    onDeleteChannel,
    selectedChannel,
  });
  const refScrollRoot = useRef<HTMLDivElement>(null);
  const [refScrollTop, entry] = useIntersectionObserver({
    root: refScrollRoot.current,
  });

  const slowTriggerScrollTop = useDebouncedCallback(() => {
    const lastPostId = postList.order.at(-1);
    if (lastPostId) {
      console.log("last post", lastPostId);
      onScrollTop(lastPostId);
    }
  }, 1000);
  const UseChatRoomActions = useChatRoomActions(
    UseChatCreateEdit.onChannelOptionSelect,
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      console.log("Intersecting");
      slowTriggerScrollTop();
    }
  }, [entry?.isIntersecting]);

  useEffect(() => {
    if (!chain) return;
    ChatStore.init(chain.uid)
      .then(async () => {
        if (chain.chat_room_ids?.length) {
          console.log("get channels");
        }
      })
      .catch((err) => {
        console.error("error mmclient", err);
        ChatStore.destroy();
      });

    return () => {
      ChatStore.destroy();
    };
  }, [chain]);

  useEffect(() => {
    if (!chain || !ChatStore.state.client) return;
    getChannels(chain.chat_room_ids || []);
  }, [ChatStore.state]);

  // useEffect(() => {
  //   if (!selectedChannel) {
  //     const _selectedChannel = channels.at(0) || null;
  //     console.log("selectedChannel", _selectedChannel?.display_name);
  //     setSelectedChannel(_selectedChannel);
  //   }
  // }, [channels]);

  useEffect(() => {
    console.log("selected channel", selectedChannel);
    if (!selectedChannel || !ChatStore.state.client) return;

    reqPostList("");
    const listener = (msg: WebSocketMessage) => {
      console.log("message listen:", msg?.event, msg);
      if (msg.event === "posted") {
        if (!selectedChannel) return;
        if (msg.data.channel_name === selectedChannel.name) {
          reqPostList("");
        }
      }
    };

    ChatStore.state.socket.addMessageListener(listener);
    return () => {
      ChatStore.state.socket?.removeMessageListener(listener);
    };
  }, [selectedChannel]);

  /** Sets the channels state and return it too */
  async function getChannels(chatRoomIDs: string[]): Promise<Channel[]> {
    if (!ChatStore.state.client) throw "Not logged in to chat";

    const _channels: Channel[] = [];
    const _mychannels = await ChatStore.state.client!.getMyChannels(
      ChatStore.state.chat_team!,
      false,
    );
    for (const ch of _mychannels) {
      if (chatRoomIDs?.includes(ch.id)) {
        _channels.push(ch);
      }
    }
    _channels.sort((a, b) => (a.create_at > b.create_at ? 1 : 0));

    setChannels(_channels);

    // if no channels are selected select the oldest
    setTimeout(() => {
      if (!selectedChannel) {
        const _selectedChannel = channels.at(0) || null;
        console.log("selectedChannel", _selectedChannel?.display_name);
        setSelectedChannel(_selectedChannel);
      }
    });

    return _channels;
  }

  async function onCreateChannel(name: string, color: string) {
    if (!chain) return;
    try {
      console.info("Creating channel", name);
      const res = await apiChat.chatCreateChannel(chain.uid, name, color);
      // update chain object from server to update chain.room_ids value
      await setChain(chain.uid, authUser);
    } catch (err) {
      console.error(err);
    }
  }

  async function onRenameChannel(
    channel: Channel,
    name: string,
    color: string,
  ) {
    if (!chain || !ChatStore.state.client) return;
    try {
      console.info("Updating channel name", name);
      channel.display_name = name;
      channel.header = color;
      await ChatStore.state.client.updateChannel(channel);
      const _channels = await getChannels(chain?.chat_room_ids || []);
      setChannels(_channels);
    } catch (err) {
      console.error(err);
    }
  }

  async function onDeleteChannel(channelID: string) {
    console.log("deleting channel", selectedChannel);
    if (!chain) return;
    try {
      console.info("Deleting channel", channelID);
      await apiChat.chatDeleteChannel(chain.uid, channelID);

      const _channels = channels.filter((c) => c.id != channelID);
      const _channel = _channels.at(-1) || null;

      await setChain(chain.uid, authUser);
    } catch (err) {
      console.error(err);
    }
  }

  function onDeletePost(postID: string) {
    if (!ChatStore.state.client) return;

    console.info("deleting post", postID);
    return ChatStore.state.client.deletePost(postID).finally(() => {
      reqPostList("");
    });
  }

  function onSelectChannel(channel: Channel, _mmClient?: Client4) {
    setSelectedChannel(channel);
  }

  async function reqPostList(lastPostId: string) {
    if (!ChatStore.state.client || !selectedChannel) return;
    console.log(
      "reqPostList",
      selectedChannel!.id,
      "next",
      postList.next_post_id,
    );
    if (loadingPostList) return;
    // Don't ask for more posts than the last post
    if (postList.prev_post_id === "" && lastPostId !== "") return;
    setLoadingPostList(true);

    const newPosts = (await ChatStore.state.client.getPostsBefore(
      selectedChannel.id,
      lastPostId,
      0,
      20,
      false,
      false,
    )) as PaginatedPostList;

    if (lastPostId === "") {
      const newPosts = (await ChatStore.state.client.getPosts(
        selectedChannel.id,
        0,
        40,
        false,
        false,
        false,
      )) as PaginatedPostList;
      setPostList(newPosts);
    } else {
      console.log("reqPostList merge", "next post id: ", lastPostId);

      // merge postlists
      setPostList((s) => ({
        order: [...s.order, ...newPosts.order],
        posts: {
          ...newPosts.posts,
          ...s.posts,
        },
        next_post_id: s.next_post_id,
        prev_post_id: newPosts.prev_post_id,
        first_inaccessible_post_time: newPosts.first_inaccessible_post_time,
        has_next: newPosts.has_next,
      }));
    }
    setLoadingPostList(false);
  }

  function onScrollTop(lastPostId: string) {
    reqPostList(lastPostId);
  }
  async function getFile(fileId: string, timestamp: number) {
    if (!selectedChannel || !ChatStore.state.client) return;
    const fileUrl = await ChatStore.state.client.getFileUrl(fileId, timestamp);
    return fileUrl.toString();
  }

  async function onSendMessageWithImage(
    message: string,
    image: File,
  ): Promise<void> {
    if (!selectedChannel || !ChatStore.state.client) return;
    console.log("reqPostList", selectedChannel.id);

    const formData = new FormData();
    formData.append("channel_id", selectedChannel.id);
    formData.append("files", image);

    try {
      const res = await ChatStore.state.client.uploadFile(formData);
      const file_id = res.file_infos[0].id;
      await ChatStore.state.client.createPost({
        channel_id: selectedChannel.id,
        message: message,
        file_ids: [file_id],
      } as Partial<Post> as Post);
    } catch (err) {
      console.error(err);
      throw err;
    }

    await reqPostList("");
  }

  async function onSendMessage(message: string) {
    if (!selectedChannel || !ChatStore.state.client) return;
    console.log("reqPostList", selectedChannel.id);
    await ChatStore.state.client.createPost({
      channel_id: selectedChannel.id,
      message: message,
    } as Partial<Post> as Post);

    await reqPostList("");
  }
  function onSendMessageWithCallback(message: string) {
    return onSendMessage(message).then(() => {
      refScrollRoot.current?.scrollTo({
        top: 0,
      });
    });
  }

  function onSendMessageWithImageWithCallback(message: string, image: File) {
    return onSendMessageWithImage(message, image).then(() => {
      refScrollRoot.current?.scrollTo({
        top: 0,
      });
    });
  }

  function onClickEnableChat() {
    if (!chain) return;
    ChatStore.init(chain.uid);
  }

  async function getMmUser(mmUserID: string): Promise<UserProfile> {
    const found = mmUser[mmUserID];
    if (found) return found;

    const res = await ChatStore.state.client?.getUser(mmUserID);
    if (!res) throw "Unable to find user";
    setMmUser((s) => ({
      [res.id]: res,
      ...s,
    }));
    return res;
  }

  if (!authUser) {
    return <Loading />;
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons>
            <IonButton
              onClick={() => UseChatCreateEdit.modal.current?.present()}
            >
              {t("edit")}
            </IonButton>
          </IonButtons>
          <IonTitle className={isThemeDefault ? "tw-text-purple" : ""}>
            Chat
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        class={isThemeDefault ? "tw-bg-purple-contrast" : ""}
      >
        <ChatCreateEdit
          {...UseChatCreateEdit}
          onRenameChannel={onRenameChannel}
          onCreateChannel={onCreateChannel}
        />

        <div className="tw-relative tw-h-full tw-flex tw-flex-col">
          <div className="tw-shrink-0 w-full">
            <ChatRoomActions {...UseChatRoomActions} />
            <ChatRoomSelect
              chainChannels={channels}
              selectedChannel={selectedChannel}
              isChainAdmin={isChainAdmin}
              onSelectChannel={onSelectChannel}
              selectedOldBulkyItems={false}
              onSelectOldBulkyItems={function (): void {
                throw new Error("Function not implemented.");
              }}
              onOpenCreateChannel={UseChatCreateEdit.onOpenCreateChannel}
              onChannelOptionSelect={UseChatCreateEdit.onChannelOptionSelect}
              isChannelActionSheetOpen={
                UseChatRoomActions.isChannelActionSheetOpen
              }
              setIsChannelActionSheetOpen={
                UseChatRoomActions.setIsChannelActionSheetOpen
              }
            />
          </div>

          <div
            ref={refScrollRoot}
            className="tw-flex-grow tw-flex tw-flex-col-reverse tw-overflow-y-auto"
          >
            {selectedOldBulkyItems ? (
              <BulkyList
                key="BulkyList"
                onSendMessageWithImage={onSendMessageWithImage}
              />
            ) : ChatStore.state.client ? (
              <ChatPostList
                key="ChatPostList"
                isChainAdmin={isChainAdmin}
                authUser={authUser}
                postList={postList}
                getMmUser={getMmUser}
                getFile={getFile}
                chainUsers={chainUsers}
                onDeletePost={onDeletePost}
              />
            ) : (
              <RoomNotReady
                isChainAdmin={isChainAdmin}
                onClickEnable={onClickEnableChat}
              />
            )}
            <span key="top" ref={refScrollTop}></span>
          </div>
          <ChatInput
            onSendMessage={onSendMessageWithCallback}
            onSendMessageWithImage={onSendMessageWithImageWithCallback}
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
