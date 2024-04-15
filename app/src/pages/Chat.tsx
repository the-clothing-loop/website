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
import { patchGetOrJoinRoom } from "../api/chat";
import { Client4, WebSocketClient, WebSocketMessage } from "@mattermost/client";
import { Sleep } from "../utils/sleep";
import { Post, PostList } from "@mattermost/types/posts";
import { addOutline } from "ionicons/icons";
import { userGetAllByChain } from "../api/user";
import { User } from "../api/types";
import ChatInput, { SendingMsgState } from "../components/Chat/ChatInput";

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
  const [chatRooms, setChatRooms] = useState<User[] | null>(null);
  const [mmClient, setMmClient] = useState<Client4 | null>(null);

  const [postList, setPostList] = useState<PostList>({
    order: [],
    posts: {},
    next_post_id: "",
    prev_post_id: "",
    first_inaccessible_post_time: 0,
  });
  const { authUser, chainUsers, isChainAdmin } = useContext(StoreContext);

  useEffect(() => {
    if (chain && !mmClient) {
      patchGetOrJoinRoom(chain.uid, !mmData.chat_token).then(async (resp) => {
        console.log(
          "chat token:\n\tNew: %s\n\tOld: %s\n",
          resp.data.chat_token,
          mmData.chat_token,
        );

        let _mmData: MmData = {
          chat_token: mmData.chat_token || resp.data.chat_token,
          ...resp.data,
        };
        console.log("chat token", _mmData.chat_token);
        if (!_mmData.chat_token) throw new Error("mmData not found");
        // Start client
        let _mmClient = new Client4();
        _mmClient.setUrl("http://localhost:5173/mm");
        _mmClient.setToken(_mmData.chat_token!);

        // Get initial post data
        await reqPostList(_mmClient, _mmData).catch((err) => {
          patchGetOrJoinRoom(chain.uid, true).then((resp) => {
            _mmData = resp.data;
            _mmClient.setToken(_mmData.chat_token!);

            return reqPostList(_mmClient, _mmData);
          });
        });

        // Start websocket
        let _mmWsClient = new WebSocketClient();
        let url = _mmClient.getWebSocketUrl().replace("http", "ws");
        _mmWsClient.initialize(url, _mmData.chat_token);

        _mmWsClient.addMessageListener((msg) => {
          console.log("message listen:", msg);
          if (msg.event === "posted") {
            handlePostedMessage(_mmClient, _mmData, msg);
          }
        });

        setMmClient(_mmClient);
        setMmWsClient(_mmWsClient);
        setMmData(_mmData);
      });
    }
    getUsersChatrooms();
  }, [mmData, chain]);

  async function handlePostedMessage(
    _mmClient: Client4,
    _mmData: MmData,
    msg: WebSocketMessagePosted,
  ) {
    if (msg.broadcast.channel_id !== _mmData.chat_channel) {
      // console.log("post channel not the same");
      return;
    }

    let newPosts = await _mmClient?.getPostsAfter(
      _mmData.chat_channel!,
      postList.next_post_id,
    );
    if (!newPosts) {
      console.log("No more new posts");
      return;
    }

    // merge postlists
    setPostList((s) => ({
      order: [...newPosts!.order, ...s.order],
      posts: {
        ...newPosts!.posts,
        ...s.posts,
      },
      next_post_id: newPosts!.next_post_id,
      prev_post_id: s.prev_post_id,
      first_inaccessible_post_time: newPosts!.first_inaccessible_post_time,
    }));

    // const postList = await mmClient?.getPosts(mmData.chat_channel);

    // if (!postList) return;
    // setPostList(postList);
  }

  async function reqPostList(_mmClient: Client4, _mmData: MmData) {
    const _postlist = await _mmClient.getPosts(_mmData.chat_channel!, 0, 20);
    setPostList(_postlist);
  }

  async function sendMessage() {
    if (!mmData.chat_channel) return;
    setSendingMsg(SendingMsgState.SENDING);
    try {
      await mmClient?.createPost({
        channel_id: mmData.chat_channel,
        message: message,
      } as Partial<Post> as Post);
      setMessage("");
      setSendingMsg(SendingMsgState.DEFAULT);
    } catch (e: any) {
      console.error("Error creating post", e);
      setSendingMsg(SendingMsgState.ERROR);
      await Sleep(1000);
      setSendingMsg(SendingMsgState.DEFAULT);
    }
  }

  async function getUsersChatrooms() {
    if (authUser) {
      try {
        let _users = (
          await Promise.all(
            authUser.chains.map((uc) => userGetAllByChain(uc.chain_uid)),
          )
        ).map((d) => d.data);
        setChatRooms(_users[0]);
      } catch (err: any) {
        console.error("Unable to load chains", err);
      }
    }
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle className={isThemeDefault ? "tw-text-purple" : ""}>
            {chain?.name}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        class={isThemeDefault ? "tw-bg-purple-contrast" : ""}
      >
        <div className="tw-relative tw-h-full tw-flex tw-flex-col">
          <div className="tw-shrink-0 w-full tw-flex tw-px-4 tw-py-2 tw-gap-2 tw-overflow-y-auto tw-bg-[#f4f1f9]">
            {chatRooms?.map((cr) => {
              let initials = cr.name
                .split(" ")
                .map((word) => word[0])
                .join("");
              let name = cr.name;
              return (
                <button
                  className="tw-w-14 tw-flex tw-flex-col tw-items-center"
                  key={name}
                >
                  <div className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-purple-shade  tw-flex tw-items-center tw-justify-center">
                    {initials}
                  </div>
                  <div className="tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem]">
                    {name}
                  </div>
                </button>
              );
            })}
            <button
              key="plus"
              className="tw-rounded-full tw-w-12 tw-h-12 tw-mr-4 tw-bg-light-shade tw-flex tw-shrink-0 tw-items-center tw-justify-center"
            >
              <IonIcon className="tw-text-2xl" src={addOutline} />
            </button>
          </div>
          <div className="tw-flex-grow tw-flex tw-flex-col-reverse tw-overflow-y-auto">
            {postList.order.map((item) => {
              let post = postList.posts[item];
              return (
                <div>
                  <IonItem
                    color="light"
                    key={post.id}
                    className={`tw-rounded-tl-2xl tw-rounded-tr-2xl tw-mb-2 ${
                      post.user_id == authUser?.uid
                        ? "tw-rounded-bl-2xl tw-float-right tw-ml-8 tw-mr-4"
                        : "tw-rounded-br-2xl tw-mr-8 tw-ml-4 tw-float-left"
                    }`}
                  >
                    <div className="tw-py-2">
                      <div className="tw-font-bold">{post.props.username}</div>
                      <div>{post.message}</div>
                    </div>
                  </IonItem>
                </div>
              );
            })}
          </div>
          <ChatInput
            sendingMsg={sendingMsg}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
