import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { sendOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { MmData, StoreContext } from "../stores/Store";
import { SetStateAction, useContext, useEffect, useState } from "react";
import * as apiChat from "../api/chat";
import { Client4, WebSocketClient, WebSocketMessage } from "@mattermost/client";
import { Sleep } from "../utils/sleep";
import { PaginatedPostList, Post, PostList } from "@mattermost/types/posts";
import { addOutline } from "ionicons/icons";
import { userGetAllByChain } from "../api/user";
import { User } from "../api/types";
import ChatInput, { SendingMsgState } from "../components/Chat/ChatInput";
import ChatPost from "../components/Chat/ChatPost";
import RoomNotReady from "../components/Chat/RoomNotReady";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Channel } from "@mattermost/types/channels";
import ChatWindow from "../components/Chat/ChatWindow";
import Loading from "../components/PrivateRoute/Loading";

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
          _mmClient.setUrl("http://localhost:5173/mm");
          // _mmClient.setToken(_mmData.chat_pass!);
          await _mmClient.login(authUser!.email, _mmData.chat_pass);
          let me = await _mmClient.getMe();
          console.log("me", me);

          // Join channels
          await apiChat.chatJoinChannels(chain.uid);

          // Start websocket
          let _mmWsClient = new WebSocketClient();
          let url = _mmClient.getWebSocketUrl().replace("http", "ws");
          _mmWsClient.initialize(url, _mmClient.getToken());

          _mmWsClient.addMessageListener((msg) => {
            console.log("message listen:", msg);
            if (msg.event === "posted") {
              // handlePostedMessage(_mmClient!, _mmData, msg);
            }
          });

          setMmClient(_mmClient);
          setMmWsClient(_mmWsClient);
          setMmData(_mmData);
        })
        .catch((err) => {
          console.error("error mmclient", err);
          setMmClient(null);
        });
    }

    if (_mmClient && chain) {
      console.log("client");
      if (chain.chat_room_ids?.length) {
        console.log("get channels");
        getChannels(_mmClient, _mmData, chain.chat_room_ids).then(
          (_channels) => {
            console.log("get channels", _channels);
            if (_channels.length > 0 && _mmClient) {
              onSelectChannel(_channels.at(0)!, _mmClient);
            }
          },
        );
      }
    }
  }, [mmData, chain]);

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

  async function onDeleteChannel() {
    console.log(selectedChannel);
    if (!chain || !mmClient) {
      if (!chain) console.error("chain not found");
      if (!mmClient) console.error("mmClient not found");
      return;
    }
    try {
      console.info("Deleting channel", name);
      // Delete channel
    } catch (err) {
      console.error(err);
    }
  }

  function onSelectChannel(channel: Channel, _mmClient?: Client4) {
    setSelectedChannel(channel);

    reqPostList(_mmClient || mmClient!, channel, "");
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
        20,
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
          <ChatWindow
            channels={channels}
            selectedChannel={selectedChannel}
            onCreateChannel={onCreateChannel}
            onSelectChannel={onSelectChannel}
            onRenameChannel={onRenameChannel}
            onDeleteChannel={onDeleteChannel}
            onSendMessage={onSendMessage}
            onScrollTop={onScrollTop}
            postList={postList}
            authUser={authUser}
          />
        )}
      </IonContent>
    </IonPage>
  );
}
