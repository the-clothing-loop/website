import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { MmData, StoreContext } from "../stores/Store";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import * as apiChat from "../api/chat";
import { Client4, WebSocketClient, WebSocketMessage } from "@mattermost/client";
import { PaginatedPostList, Post } from "@mattermost/types/posts";
import RoomNotReady from "../components/Chat/RoomNotReady";
import { Channel } from "@mattermost/types/channels";
import ChatWindow from "../components/Chat/ChatWindow";
import Loading from "../components/PrivateRoute/Loading";
import { UserProfile } from "@mattermost/types/users";
import ChatRoomSelect from "../components/Chat/ChatRoomSelect";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import ChatInput from "../components/Chat/ChatInput";
import ChatPost from "../components/Chat/ChatPost";
import ChatPostList from "../components/Chat/ChatPostList";
import BulkyList from "../components/Chat/BulkyList";

const VITE_CHAT_URL = import.meta.env.VITE_CHAT_URL;

export type OnSendMessageWithImage = (
  message: string,
  file: string,
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
  const { chain, setChain, mmData, setMmData, isThemeDefault } =
    useContext(StoreContext);

  const [mmWsClient, setMmWsClient] = useState<WebSocketClient | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedOldBulkyItems, setSelectedOldBulkyItems] = useState(false);
  const [mmUser, setMmUser] = useState<Record<string, UserProfile>>({});
  const [mmClient, setMmClient] = useState<Client4 | null | undefined>(
    undefined,
  );
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
  const refScrollRoot = useRef<HTMLDivElement>(null);
  const [refScrollTop, entry] = useIntersectionObserver({
    root: refScrollRoot.current,
  });
  const scrollTop = () => refScrollRoot.current?.scrollTo({ top: 0 });

  useEffect(() => {
    if (!chain || !mmData) return;
    let _mmData = mmData;
    let _mmClient = mmClient;
    if (chain && !_mmClient) {
      apiChat
        .chatPatchUser(chain.uid)
        .then(async (resp) => {
          console.log(
            "chat token:\n\tNew: %s\n\tOld: %s\n",
            resp.data.chat_pass,
            mmData.chat_pass,
          );

          _mmData = resp.data;
          console.log("chat token", _mmData.chat_pass);
          if (!_mmData.chat_pass || !_mmData.chat_user)
            throw new Error("mmData not found");
          // Start client
          _mmClient = new Client4();
          _mmClient.setUrl(VITE_CHAT_URL);
          await _mmClient.loginById(_mmData.chat_user, _mmData.chat_pass);
          let me = await _mmClient.getMe();
          console.log("me", me);

          // Join channels
          await apiChat.chatJoinChannels(chain.uid);

          // Start websocket
          let _mmWsClient = new WebSocketClient();
          let url = _mmClient.getWebSocketUrl().replace("http", "ws");
          _mmWsClient.initialize(url, _mmClient.getToken());

          setMmClient(_mmClient);
          setMmWsClient(_mmWsClient);
          setMmData(_mmData);
          if (chain.chat_room_ids?.length) {
            console.log("get channels");
            await getChannels(_mmClient, _mmData, chain.chat_room_ids);
          }
        })
        .catch((err) => {
          console.error("error mmclient", err);
          setMmClient(null);
        });
    }

    if (_mmClient && chain) {
      console.log("client");
    }
  }, [mmData, chain]);

  useEffect(() => {
    console.log("selected channel", selectedChannel);
    if (!selectedChannel || !mmClient || !mmWsClient) return;

    mmClient.getTeamMembers(selectedChannel.id).then((res) => {
      console.log(
        "view",
        res[0].mention_count_root,
        "channel id",
        selectedChannel.id,
        "user id",
        mmUser.id,
      );
    });

    reqPostList(mmClient, selectedChannel, "");
    const listener = (msg: WebSocketMessage) => {
      console.log("message listen:", msg?.event, msg);
      if (msg.event === "posted") {
        if (!mmClient || !selectedChannel) return;

        if (msg.data.channel_name === selectedChannel.name) {
          reqPostList(mmClient, selectedChannel, "");
        }
      }
    };

    mmWsClient.addMessageListener(listener);
    return () => {
      mmWsClient.removeMessageListener(listener);
    };
  }, [selectedChannel]);

  const chainChannels = useMemo(() => {
    if (!chain || !chain.chat_room_ids) return [];
    console.log("chainChannels", channels);
    return channels.sort((a, b) => (a.create_at > b.create_at ? 1 : 0));
  }, [channels, chain]);

  /** Sets the channels state and return it too */
  async function getChannels(
    _mmClient: Client4,
    _mmData: MmData,
    chatRoomIDs: string[],
  ): Promise<Channel[]> {
    if (!_mmData.chat_team) throw "Not logged in to chat";

    const _channels: Channel[] = [];
    const _mychannels = await _mmClient.getMyChannels(_mmData.chat_team, false);
    for (const ch of _mychannels) {
      if (chatRoomIDs?.includes(ch.id)) {
        _channels.push(ch);
      }
    }
    _channels.sort((a, b) => (a.create_at > b.create_at ? 1 : 0));

    // if no channels are selected select the oldest
    const _selectedChannel = selectedChannel;
    if (!_selectedChannel) {
      const _selectedChannel = _channels.at(0) || null;
      if (_selectedChannel) onSelectChannel(_selectedChannel);
    }
    if (!_selectedChannel) onSelectOldBulkyItems();

    setChannels(_channels);
    return _channels;
  }

  async function onCreateChannel(name: string) {
    if (!chain || !mmClient) {
      if (!chain) console.error("chain not found");
      if (!mmClient) console.error("mmClient not found");
      return;
    }
    try {
      console.info("Creating channel", name);
      const res = await apiChat.chatCreateChannel(chain.uid, name);
      const id = res.data.chat_channel;
      const _channels = await getChannels(mmClient, mmData, [
        ...(chain.chat_room_ids || []),
        id,
      ]);
      const _channel = _channels.find((c) => c.id == id) || null;

      setChannels(_channels);
      setSelectedChannel(_channel);
      // update chain object from server to update chain.room_ids value
      await setChain(chain.uid, authUser);
      if (!_channel) return;
      reqPostList(mmClient, _channel, "");
    } catch (err) {
      console.error(err);
    }
  }

  async function onRenameChannel(channel: Channel, name: string) {
    if (!chain || !mmClient) {
      if (!chain) console.error("chain not found");
      if (!mmClient) console.error("mmClient not found");
      return;
    }
    try {
      console.info("Updating channel name", name);
      channel.display_name = name;
      await mmClient.updateChannel(channel);
      const _channels = await getChannels(
        mmClient,
        mmData,
        chain?.chat_room_ids || [],
      );
      setChannels(_channels);
    } catch (err) {
      console.error(err);
    }
  }

  async function onDeleteChannel(channelID: string) {
    console.log(selectedChannel);
    if (!chain || !mmClient) {
      if (!chain) console.error("chain not found");
      if (!mmClient) console.error("mmClient not found");
      return;
    }
    try {
      console.info("Deleting channel", channelID);
      await apiChat.chatDeleteChannel(chain.uid, channelID);

      const _channels = channels.filter((c) => c.id != channelID);
      const _channel = _channels.at(-1) || null;

      setChannels(_channels);
      setSelectedChannel(_channel);
      // update chain object from server to update chain.room_ids value
      await setChain(chain.uid, authUser);
      if (!_channel) return;
      reqPostList(mmClient, _channel, "");
    } catch (err) {
      console.error(err);
    }
  }

  function onDeletePost(postID: string) {
    if (!mmClient) return;

    console.info("deleting post", postID);
    return mmClient.deletePost(postID).finally(() => {
      reqPostList(mmClient, selectedChannel!, "");
    });
  }

  function onSelectChannel(channel: Channel, _mmClient?: Client4) {
    setSelectedOldBulkyItems(false);
    setSelectedChannel(channel);

    _mmClient = _mmClient || mmClient!;

    reqPostList(_mmClient, channel, "");
  }

  async function reqPostList(
    _mmClient: Client4,
    _selectedChannel: Channel,
    lastPostId: string,
  ) {
    console.log(
      "reqPostList",
      _selectedChannel.id,
      "next",
      postList.next_post_id,
    );
    if (loadingPostList) return;
    // Don't ask for more posts than the last post
    if (postList.prev_post_id === "" && lastPostId !== "") return;
    setLoadingPostList(true);

    const newPosts = (await _mmClient.getPostsBefore(
      _selectedChannel.id,
      lastPostId,
      0,
      20,
      false,
      false,
    )) as PaginatedPostList;

    if (lastPostId === "") {
      const newPosts = (await _mmClient.getPosts(
        _selectedChannel.id,
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
    if (!mmClient || !selectedChannel) return;
    reqPostList(mmClient, selectedChannel, lastPostId);
  }
  async function getFile(fileId: string, timestamp: number) {
    if (!selectedChannel || !mmClient) return;
    const fileUrl = await mmClient.getFileUrl(fileId, timestamp);
    return fileUrl.toString();
  }

  function onSendMessageWithImage(
    message: string,
    image: File | string,
  ): Promise<void> {
    return (async () => {
      if (!selectedChannel || !mmClient) return;
      console.log("reqPostList", selectedChannel.id);

      const formData = new FormData();
      formData.append("channel_id", selectedChannel.id);
      formData.append("files", image);

      try {
        const res = await mmClient.uploadFile(formData);
        const file_id = res.file_infos[0].id;
        await mmClient.createPost({
          channel_id: selectedChannel.id,
          message: message,
          file_ids: [file_id],
        } as Partial<Post> as Post);
      } catch (err) {
        console.error(err);
        throw err;
      }

      if (!selectedChannel || !mmClient) return;

      await reqPostList(mmClient, selectedChannel, "");
    })().then(() => {
      scrollTop();
    });
  }

  async function onSendMessage(message: string) {
    if (!selectedChannel || !mmClient) return;
    console.log("reqPostList", selectedChannel.id);
    await mmClient.createPost({
      channel_id: selectedChannel.id,
      message: message,
    } as Partial<Post> as Post);

    await reqPostList(mmClient, selectedChannel, "");
    scrollTop();
  }

  function onClickEnableChat() {
    if (!chain) return;
    apiChat.chatPatchUser(chain.uid);
  }

  async function getMmUser(mmUserID: string): Promise<UserProfile> {
    const found = mmUser[mmUserID];
    if (found) return found;

    const res = await mmClient?.getUser(mmUserID);
    if (!res) throw "Unable to find user";
    setMmUser((s) => ({
      [res.id]: res,
      ...s,
    }));
    return res;
  }

  function onSelectOldBulkyItems() {
    setSelectedChannel(null);
    setSelectedOldBulkyItems(true);
  }
  function onDeleteChannelSubmit() {
    if (!selectedChannel) return;
    if (selectedChannel) onDeleteChannel(selectedChannel.id);
  }
  function onRenameChannelSubmit(name: string) {
    if (!selectedChannel) return;
    onRenameChannel(selectedChannel, name);
  }

  if (!authUser) {
    return <Loading />;
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle className={isThemeDefault ? "tw-text-purple" : ""}>
            Chat
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        class={isThemeDefault ? "tw-bg-purple-contrast" : ""}
      >
        <div className="tw-relative tw-h-full tw-flex tw-flex-col">
          <ChatRoomSelect
            chainChannels={chainChannels}
            selectedChannel={selectedChannel}
            isChainAdmin={isChainAdmin}
            onSelectChannel={onSelectChannel}
            onCreateChannel={onCreateChannel}
            onDeleteChannelSubmit={onDeleteChannelSubmit}
            onRenameChannelSubmit={onRenameChannelSubmit}
            selectedOldBulkyItems={selectedOldBulkyItems}
            onSelectOldBulkyItems={onSelectOldBulkyItems}
          />
          <div
            ref={refScrollRoot}
            className={"tw-flex-grow tw-flex tw-overflow-y-auto".concat(
              selectedOldBulkyItems ? "" : " tw-flex-col-reverse",
            )}
          >
            {selectedOldBulkyItems ? (
              <BulkyList />
            ) : mmClient ? (
              <ChatPostList
                isChainAdmin={isChainAdmin}
                authUser={authUser}
                getMmUser={getMmUser}
                getFile={getFile}
                postList={postList}
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
            isOldBulkyItems={selectedOldBulkyItems}
            onSendMessage={onSendMessage}
            onSendMessageWithImage={onSendMessageWithImage}
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
