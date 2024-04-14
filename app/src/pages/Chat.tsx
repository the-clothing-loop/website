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
import { MmData, StoreContext } from "../Store";
import { useContext, useEffect, useState } from "react";
import {
  Chain,
  User,
  chainGet,
  patchGetOrJoinRoom,
  userGetAllByChain,
  userGetByUID,
} from "../api";
import { Client4, WebSocketClient, WebSocketMessage } from "@mattermost/client";
import { Sleep } from "../utils/sleep";
import { Post, PostList } from "@mattermost/types/posts";
import { addOutline } from "ionicons/icons";

const VITE_CHAT_URL = import.meta.env.VITE_CHAT_URL;

enum SendingMsgState {
  DEFAULT,
  SENDING,
  ERROR,
}

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
  // const [, setMessage] = useState("");

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
        let _users: User[][];

        let data = await Promise.all(
          authUser.chains.map((uc) => userGetAllByChain(uc.chain_uid)),
        );
        console.log(data);
        _users = data.map((d) => d.data);

        console.log(_users, _users[0]);

        setChatRooms(_users[0]);
      } catch (err: any) {
        console.error("Unable to load chains", err);
        //addToastError(GinParseErrors(t, err), err.status);
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
        <div className="tw-relative tw-h-full">
          <div className="tw-fixed tw-z-10 tw-w-full tw-bg-[#f4f1f9]">
            <div className="tw-flex tw-ml-5 tw-mb-2 tw-mt-2 tw-overflow-x-auto">
              <div className="tw-rounded-full tw-w-14 tw-h-14 tw-mr-4 tw-bg-purple-shade tw-flex tw-items-center tw-justify-center">
                <IonIcon className="tw-text-2xl" src={addOutline} />
              </div>
              {chatRooms?.map((cr) => {
                let initials = "";
                cr.name.split(" ").forEach((word) => {
                  initials += word[0];
                });
                return (
                  <div className="tw-mr-4 tw-w-14">
                    <div className="tw-shrink-0 tw-rounded-full tw-h-14 tw-bg-purple-shade tw-flex tw-items-center tw-justify-center">
                      <div className="tw-font-bold">{initials}</div>
                    </div>
                    <div className="tw-text-xs tw-text-center tw-truncate">
                      {cr.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tw-flex tw-flex-col tw-absolute tw-bottom-0 tw-max-h-[75vh]">
            <div className="tw-flex-grow tw-overflow-y-auto tw-flex tw-flex-col-reverse">
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
                        <div className="tw-font-bold">
                          {post.props.username}
                        </div>
                        <div>{post.message}</div>
                      </div>
                    </IonItem>
                  </div>
                );
              })}
            </div>
            <div>
              <IonItem
                color="light"
                disabled={sendingMsg == SendingMsgState.SENDING}
              >
                <IonInput
                  placeholder="Send Message"
                  value={message}
                  disabled={sendingMsg == SendingMsgState.SENDING}
                  onIonInput={(e) => setMessage(e.detail.value as string)}
                  className="tw-ml-2"
                />
                <IonButton
                  slot="end"
                  onClick={sendMessage}
                  shape="round"
                  disabled={message == ""}
                  color="light"
                  className="tw-mr-0"
                >
                  <IonIcon
                    icon={sendOutline}
                    color="primary"
                    className="tw-text-2xl"
                  />
                </IonButton>
              </IonItem>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
