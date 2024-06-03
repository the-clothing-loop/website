import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { MmData, StoreContext } from "../stores/Store";
import { useContext, useEffect, useRef, useState } from "react";
import * as apiChat from "../api/chat";
import { Client4, WebSocketClient, WebSocketMessage } from "@mattermost/client";
import { PaginatedPostList, Post } from "@mattermost/types/posts";
import RoomNotReady from "../components/Chat/RoomNotReady";
import { Channel } from "@mattermost/types/channels";
import ChatWindow from "../components/Chat/ChatWindow";
import Loading from "../components/PrivateRoute/Loading";
import { UserProfile } from "@mattermost/types/users";

const VITE_CHAT_URL = import.meta.env.VITE_CHAT_URL;

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
    if (!selectedChannel) {
      const _selectedChannel = _channels.at(0) || null;
      console.log("selectedChannel", _selectedChannel?.display_name);
      setSelectedChannel(_selectedChannel);
    }

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

  async function onSendMessageWithImage(
    message: string,
    image: File,
    callback: Function,
  ) {
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

    reqPostList(mmClient, selectedChannel, "").then(() => callback());
  }

  async function onSendMessage(message: string, callback: Function) {
    if (!selectedChannel || !mmClient) return;
    console.log("reqPostList", selectedChannel.id);
    await mmClient.createPost({
      channel_id: selectedChannel.id,
      message: message,
    } as Partial<Post> as Post);

    reqPostList(mmClient, selectedChannel, "").then(() => callback());
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

  if (mmClient === undefined || !authUser) {
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
        {mmClient === null ? (
          <RoomNotReady
            isChainAdmin={isChainAdmin}
            onClickEnable={onClickEnableChat}
          />
        ) : (
          <>
            <ChatWindow
              getMmUser={getMmUser}
              channels={channels}
              selectedChannel={selectedChannel}
              onCreateChannel={onCreateChannel}
              onSelectChannel={onSelectChannel}
              onRenameChannel={onRenameChannel}
              onDeleteChannel={onDeleteChannel}
              onDeletePost={onDeletePost}
              getFile={getFile}
              onSendMessage={onSendMessage}
              onSendMessageWithImage={onSendMessageWithImage}
              onScrollTop={onScrollTop}
              postList={postList}
              authUser={authUser}
            />
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
