import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { StoreContext } from "../stores/Store";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import * as apiChat from "../api/chat";
import RoomNotReady from "../components/Chat/RoomNotReady";
import Loading from "../components/PrivateRoute/Loading";
import ChatRoomSelect from "../components/Chat/ChatRoomSelect";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import ChatInput from "../components/Chat/ChatInput";
import ChatPostList from "../components/Chat/ChatPostList";
import BulkyList from "../components/Chat/BulkyList";

import {
  Client,
  Channel,
  ChannelMessageList,
  User,
  Session,
  Socket,
  UserGroup,
} from "@heroiclabs/nakama-js";

import { uploadImage } from "../api/imgbb";
import { bulkyItemPut } from "../api/bulky";
import { useLocation } from "react-router";

const VITE_CHAT_HOST = import.meta.env.VITE_CHAT_HOST;
const VITE_CHAT_PORT = import.meta.env.VITE_CHAT_PORT;
const VITE_CHAT_SERVER_KEY = import.meta.env.VITE_CHAT_SERVER_KEY;
const VITE_CHAT_SSL = import.meta.env.VITE_CHAT_SSL == "true";

const nakamaClient = new Client(
  VITE_CHAT_SERVER_KEY,
  VITE_CHAT_HOST,
  VITE_CHAT_PORT,
  VITE_CHAT_SSL,
);

const IS_GROUP_OPEN = true;

export type OnSendMessageWithImage = (
  title: string,
  message: string,
  file: string,
) => Promise<void>;

// This follows the controller / view component pattern
export default function Chat() {
  const location = useLocation();
  const { chain, setChain, isThemeDefault } = useContext(StoreContext);

  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [selectedOldBulkyItems, setSelectedOldBulkyItems] = useState(false);
  const [postList, setPostList] = useState<ChannelMessageList>({
    messages: [],
  });
  const [mmUsers, setMmUsers] = useState<Record<string, User>>({});
  const [loadingPostList, setLoadingPostList] = useState(false);
  const { authUser, chainUsers, isChainAdmin } = useContext(StoreContext);
  const refScrollRoot = useRef<HTMLDivElement>(null);
  const [refScrollTop] = useIntersectionObserver({
    root: refScrollRoot.current,
  });
  const scrollTop = () => refScrollRoot.current?.scrollTo({ top: 0 });
  const nakama = useNakama();

  useEffect(() => {
    if (chain && authUser) {
      if (!nakama.state.session) {
        nakama
          .createSession(authUser.uid, authUser.email)
          .then(async () => {
            console.info("session user id ", nakama.state.session?.user_id);
            try {
              let chatRoomIds = chain.chat_room_ids || [];
              if (!chain.chat_room_ids?.length && isChainAdmin) {
                console.info("create first group");
                const group = await nakamaClient.createGroup(
                  nakama.state.session!,
                  {
                    avatar_url: "" /* Add here the chat color*/,
                    description: "",
                    name: "General",
                    open: true,
                  },
                );
                await apiChat.chatCreateGroup(chain.uid, group.id);
                console.info("create group", group.id!);
                chatRoomIds.push(group.id!);
              }
              await getGroups(chatRoomIds, true);
            } catch (err) {
              console.error("error nakamaClient", err);
              if (nakama.state.session) {
                console.error("nakama.state.session logout due to error");
                nakamaClient.sessionLogout(
                  nakama.state.session,
                  nakama.state.session.token,
                  nakama.state.session.refresh_token,
                );
              }
            }
          })
          .catch((err) => {
            console.error("error nakamaClient", err);
          });
      } else {
        getGroups(chain.chat_room_ids || [], true);
      }
    }
  }, [location]);

  const chainChannels = useMemo(() => {
    if (!chain || !chain.chat_room_ids) return [];
    console.log("chainChannels", groups);
    return groups.sort((a, b) =>
      Date.parse(a.group!.create_time!) > Date.parse(b.group!.create_time!)
        ? 1
        : 0,
    );
  }, [groups, chain]);

  /** Sets the channels state and return it too */
  async function getGroups(
    chatRoomIDs: string[],
    isFirstTime: boolean = false,
  ): Promise<UserGroup[]> {
    if (!nakamaClient) throw "nClient is not available";
    if (!nakama.state.session) throw "nSession is not available";

    let _groups = await nakamaClient
      .listUserGroups(nakama.state.session, nakama.state.session.user_id!)
      .then<UserGroup[]>((res) => {
        if (!res.user_groups) return [];
        return res.user_groups;
      });

    // if first time find groups that are not available in nakama and join them
    if (isFirstTime) {
      let foundUnJoinedGroups = false;
      const groupIds = _groups.map((ug) => ug.group!.id!);
      // find loop groups that are not joined yet by the nakama user
      for (const chatRoomID of chatRoomIDs) {
        const found = groupIds.includes(chatRoomID);
        if (!found) {
          const ok = await nakamaClient
            .joinGroup(nakama.state.session, chatRoomID)
            .catch((e) => console.error("unable to find group", chatRoomID, e));
          if (ok) {
            foundUnJoinedGroups = true;
          }
        }
      }
      if (foundUnJoinedGroups) {
        _groups = await nakamaClient
          .listUserGroups(nakama.state.session, nakama.state.session.user_id!)
          .then<UserGroup[]>((res) => {
            console.log("listUserGroups", res);
            if (!res.user_groups) return [];
            return res.user_groups;
          });
      }
    }

    _groups = _groups.filter((ug) => chatRoomIDs.includes(ug.group!.id!));

    _groups.sort((a, b) =>
      Date.parse(a.group!.create_time!) > Date.parse(b.group!.create_time!)
        ? 1
        : 0,
    );

    setGroups(_groups);

    if (isFirstTime) {
      // if no channels are selected select the oldest
      let _selectedGroup: UserGroup | null = _groups[0] || null;
      console.log("selectedGroup", _selectedGroup, "_groups", _groups);
      if (_selectedGroup) {
        console.info("select first group", _selectedGroup);
        onSelectGroup(_selectedGroup);
      }
      if (!_selectedGroup) onSelectOldBulkyItems();
    }

    return _groups;
  }

  async function onCreateChannel(name: string, color: string) {
    if (!chain || !nakama.state.session) {
      if (!chain) console.error("chain not found");
      if (!nakamaClient) console.error("nClient not found");
      if (!nakama.state.session) console.error("nSession not found");
      return;
    }
    try {
      console.info("Creating channel", name);
      const group = await nakamaClient.createGroup(nakama.state.session, {
        name: crypto.randomUUID().toString(),
        description: name,
        avatar_url: color,
        open: IS_GROUP_OPEN,
      });
      await apiChat.chatCreateGroup(chain.uid, group.id!);
      const _groups = await getGroups([
        ...(chain.chat_room_ids || []),
        group.id!,
      ]);
      const _group = _groups.find((c) => c.group!.id == group.id!) || null;

      // update chain object from server to update chain.room_ids value
      await setChain(chain.uid, authUser);
      if (!_group) {
        onSelectOldBulkyItems();
      } else {
        await onSelectGroup(_group);
      }
      if (!_group) return;
    } catch (err) {
      console.error(err);
    }
  }

  async function onRenameChannel(channel: UserGroup, name: string) {
    if (!chain || !nakamaClient || !nakama.state.session) {
      if (!chain) console.error("chain not found");
      if (!nakamaClient) console.error("nakamaClient not found");
      if (!nakama.state.session)
        console.error("nakama.state.session not found");
      return;
    }
    try {
      console.info("Updating channel name", name);
      await nakamaClient.updateGroup(nakama.state.session, channel.group!.id!, {
        description: name,
      });
      await getGroups(chain?.chat_room_ids || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function onDeleteChannel(channelID: string) {
    console.log(selectedGroup);
    if (!chain || !nakamaClient) {
      if (!chain) console.error("chain not found");
      if (!nakamaClient) console.error("nakamaClient not found");
      if (!nakama.state.session)
        console.error("nakama.state.session not found");
      return;
    }
    try {
      console.info("Deleting channel", channelID);
      await apiChat.chatDeleteGroup(chain.uid, channelID);

      const _channels = groups.filter((c) => c.group!.id != channelID);
      const _channel = _channels.at(-1) || null;

      setGroups(_channels);
      setSelectedGroup(_channel);
      // update chain object from server to update chain.room_ids value
      await setChain(chain.uid, authUser);
      if (!_channel) return;
      reqPostList("current");
    } catch (err) {
      console.error(err);
    }
  }

  function onDeletePost(postID: string) {
    if (!nakamaClient || !nakama.state.socket || !selectedGroup) return;

    console.info("deleting post", postID);
    nakama.state.socket
      ?.removeChatMessage(nakama.state.channel!.id!, postID)
      .finally(() => {
        reqPostList("current");
      });
  }

  async function onSelectGroup(group: UserGroup) {
    if (nakama.state.socket && nakama.state.channel)
      nakama.state.socket.leaveChat(nakama.state.channel.id!);

    setSelectedOldBulkyItems(false);
    setSelectedGroup(group);
    console.info("selected group", group.group!.id);
    if (!group || !nakamaClient || !nakama.state.session) return;
    if (!nakama.state.socket) {
      nakama.createSocket();
      await nakama.state.socket!.connect(nakama.state.session, true);
    }
    nakama.state.channel = await nakama.state.socket!.joinChat(
      group.group!.id!,
      3,
      true,
      false,
    );

    nakama.state.socket!.onchannelmessage = (msg) => {
      console.log("channel message", msg);
      if (msg.channel_id == nakama.state.channel?.id) reqPostList("current");
    };
    setTimeout(() => {
      reqPostList("current");
    }, 0);
  }

  async function reqPostList(cursor: "previous" | "current") {
    if (loadingPostList) return;
    // Don't ask for more posts than the last post
    if (cursor == "previous" && !postList.next_cursor) return;
    setLoadingPostList(true);
    if (!nakamaClient || !nakama.state.session) return;

    const newPosts = await nakamaClient.listChannelMessages(
      nakama.state.session,
      nakama.state.channel!.id,
      100,
      false,
      cursor == "previous" ? postList.next_cursor : undefined,
    );

    if (cursor == "previous") {
      setPostList((s) => ({
        cacheable_cursor: newPosts.cacheable_cursor,
        messages: [...s.messages!, ...newPosts.messages!],
        next_cursor: newPosts.next_cursor,
        prev_cursor: s.prev_cursor,
      }));
    } else {
      setPostList(newPosts);
    }
    setLoadingPostList(false);
  }

  function onSendMessageWithImage(
    title: string,
    message: string,
    image: string,
  ): Promise<void> {
    return (async () => {
      if (!selectedOldBulkyItems) {
        console.log("Images not supported yet in chat");
        return;
      }

      if (selectedOldBulkyItems) {
        if (!authUser || !chain) return;
        const res = await uploadImage(image, 800);
        res.data.image;
        bulkyItemPut({
          chain_uid: chain.uid,
          user_uid: authUser.uid,
          title,
          message,
        });
      } else {
        await reqPostList("current");
      }
    })().then(() => {
      scrollTop();
    });
  }

  async function onSendMessage(message: string) {
    if (
      !selectedGroup ||
      !nakama.state.socket ||
      !nakamaClient ||
      !nakama.state.channel
    )
      return;
    await nakama.state.socket.writeChatMessage(nakama.state.channel!.id!, {
      message,
    });

    await reqPostList("current");
    scrollTop();
  }

  function onClickEnableChat() {
    apiChat.chatPatchUser();
  }

  async function getMmUser(mmUserID: string): Promise<User> {
    const found = mmUsers[mmUserID];
    if (found) return found;
    if (!nakama.state.session) throw "No session";

    const res = await nakamaClient?.getUsers(nakama.state.session, [mmUserID]);
    if (!res?.users?.length) throw "Unable to find user";
    const firstUser = res.users[0];
    setMmUsers((s) => ({
      [firstUser.id!]: firstUser,
      ...s,
    }));
    return firstUser;
  }

  function onSelectOldBulkyItems() {
    setSelectedGroup(null);
    setSelectedOldBulkyItems(true);
    if (nakama.state.channel && nakama.state.socket)
      nakama.state.socket.leaveChat(nakama.state.channel.id!);
  }
  function onDeleteChannelSubmit() {
    if (!selectedGroup) return;
    if (selectedGroup) onDeleteChannel(selectedGroup.group!.id!);
  }
  function onRenameChannelSubmit(name: string) {
    if (!selectedGroup) return;
    onRenameChannel(selectedGroup, name);
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
            selectedChannel={selectedGroup}
            isChainAdmin={isChainAdmin}
            onSelectChannel={onSelectGroup}
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
            ) : nakama.state.session ? (
              <ChatPostList
                isChainAdmin={isChainAdmin}
                authUser={authUser}
                getMmUser={getMmUser}
                // getFile={getFile}
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

function useNakama() {
  const [state] = useState<{
    channel?: Channel;
    session?: Session;
    socket?: Socket;
  }>({});

  const createSession = (uid: string, email: string) =>
    apiChat.chatPatchUser().then(async (resp) => {
      const password = resp.data.chat_pass;
      state.session = await nakamaClient.authenticateEmail(
        email,
        password,
        true,
        uid,
      );
      console.info("create session", state.session);
    });

  const createSocket = () => {
    state.socket = nakamaClient.createSocket(VITE_CHAT_SSL);
  };

  return { createSession, createSocket, state };
}
