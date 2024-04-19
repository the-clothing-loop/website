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
import { Post, PostList } from "@mattermost/types/posts";
import { addOutline } from "ionicons/icons";
import { userGetAllByChain } from "../api/user";
import { User } from "../api/types";
import ChatInput, { SendingMsgState } from "../components/Chat/ChatInput";
import ChatPost from "../components/Chat/ChatPost";
import RoomNotReady from "../components/Chat/RoomNotReady";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Channel } from "@mattermost/types/channels";
import ChatWindow from "../components/Chat/ChatWindow";

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

export default function Chat() {
  const { t } = useTranslation();
  const { chain, mmData, setMmData, isThemeDefault } = useContext(StoreContext);

  const [mmWsClient, setMmWsClient] = useState<WebSocketClient | null>(null);
  const [message, setMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(SendingMsgState.DEFAULT);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [mmClient, setMmClient] = useState<Client4 | null | undefined>(
    undefined,
  );

  const [postList, setPostList] = useState<PostList>({
    order: [],
    posts: {},
    next_post_id: "",
    prev_post_id: "",
    first_inaccessible_post_time: 0,
  });
  const { authUser, chainUsers, isChainAdmin } = useContext(StoreContext);

  useEffect(() => {
    let _mmData = mmData;
    let _mmClient = mmClient;
    if (chain && !_mmClient) {
      apiChat
        .chatPatchUser(chain.uid, !mmData.chat_token)
        .then(async (resp) => {
          console.log(
            "chat token:\n\tNew: %s\n\tOld: %s\n",
            resp.data.chat_token,
            mmData.chat_token,
          );

          _mmData = {
            chat_token: resp.data.chat_token || mmData.chat_token,
            ...resp.data,
          };
          console.log("chat token", _mmData.chat_token);
          if (!_mmData.chat_token) throw new Error("mmData not found");
          // Start client
          _mmClient = new Client4();
          _mmClient.setUrl("http://localhost:5173/mm");
          _mmClient.setToken(_mmData.chat_token!);

          // Join channels
          await apiChat.chatJoinChannels(chain.uid);

          // Start websocket
          let _mmWsClient = new WebSocketClient();
          let url = _mmClient.getWebSocketUrl().replace("http", "ws");
          _mmWsClient.initialize(url, _mmData.chat_token);

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
      if (chain.chat_room_ids?.length) {
        getChannels(_mmClient, _mmData, chain.chat_room_ids).then(
          (_channels) => {
            if (_channels.length > 0) {
              setSelectedChannel(_channels[0]);
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
      setSelectedChannel(_channels.at(-1) || null);
    } catch (err) {
      console.error(err);
    }
  }

  function onSelectChannel(channelIndex: number) {
    setSelectedChannel(channels.at(channelIndex) || null);
  }

  // async function handlePostedMessage(
  //   _mmClient: Client4,
  //   _mmData: MmData,
  //   msg: WebSocketMessagePosted,
  // ) {
  //   if (msg.broadcast.channel_id !== _mmData.chat_channel) {
  //     // console.log("post channel not the same");
  //     return;
  //   }

  //   let newPosts = await _mmClient?.getPostsAfter(
  //     _mmData.chat_channel!,
  //     postList.next_post_id,
  //   );
  //   if (!newPosts) {
  //     console.log("No more new posts");
  //     return;
  //   }

  //   // merge postlists
  //   setPostList((s) => ({
  //     order: [...newPosts!.order, ...s.order],
  //     posts: {
  //       ...newPosts!.posts,
  //       ...s.posts,
  //     },
  //     next_post_id: newPosts!.next_post_id,
  //     prev_post_id: s.prev_post_id,
  //     first_inaccessible_post_time: newPosts!.first_inaccessible_post_time,
  //   }));

  //   // const postList = await mmClient?.getPosts(mmData.chat_channel);

  //   // if (!postList) return;
  //   // setPostList(postList);
  // }

  // async function reqPostList(_mmClient: Client4, _mmData: MmData) {
  //   _mmClient.getChannels(mmData.chat_channels)
  //   const _postlist = await _mmClient.getPosts(_mmData.chat_channel!, 0, 20);
  //   setPostList(_postlist);
  // }

  // async function sendMessage() {
  //   if (!mmData.chat_channel) return;
  //   setSendingMsg(SendingMsgState.SENDING);
  //   try {
  //     await mmClient?.createPost({
  //       channel_id: mmData.chat_channel,
  //       message: message,
  //     } as Partial<Post> as Post);
  //     setMessage("");
  //     setSendingMsg(SendingMsgState.DEFAULT);
  //   } catch (e: any) {
  //     console.error("Error creating post", e);
  //     setSendingMsg(SendingMsgState.ERROR);
  //     await Sleep(1000);
  //     setSendingMsg(SendingMsgState.DEFAULT);
  //   }
  // }

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
          <RoomNotReady isChainAdmin={isChainAdmin} onClickEnable={() => {}} />
        ) : mmClient === undefined ? (
          <RoomNotReady isChainAdmin={isChainAdmin} onClickEnable={() => {}} />
        ) : (
          <ChatWindow
            channels={channels}
            selectedChannel={selectedChannel}
            onCreateChannel={onCreateChannel}
            onSelectChannel={onSelectChannel}
          />
        )}
      </IonContent>
    </IonPage>
  );
}
