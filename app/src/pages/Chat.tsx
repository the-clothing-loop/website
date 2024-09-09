import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
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
  Session,
  Socket,
  Group,
  ChannelMessageList,
  User,
  Channel,
} from "@heroiclabs/nakama-js";

import { uploadImage } from "../api/imgbb";
import { bulkyItemPut } from "../api/bulky";

const VITE_CHAT_HOST = import.meta.env.VITE_CHAT_HOST;
const VITE_CHAT_PORT = import.meta.env.VITE_CHAT_PORT;
const VITE_CHAT_SERVER_KEY = import.meta.env.VITE_CHAT_SERVER_KEY;
const VITE_CHAT_SSL = import.meta.env.VITE_CHAT_SSL == "true";

const IS_GROUP_OPEN = true;

export type OnSendMessageWithImage = (
  title: string,
  message: string,
  file: string,
) => Promise<void>;

type MmData = { userId: string; pass: string };

// This follows the controller / view component pattern
export default function Chat() {
  const { t } = useTranslation();
  const { chain, setChain, isThemeDefault } = useContext(StoreContext);

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedOldBulkyItems, setSelectedOldBulkyItems] = useState(false);
  const [postList, setPostList] = useState<ChannelMessageList>({
    messages: [],
  });
  const [mmData, setMmData] = useState<MmData>();
  const [mmUsers, setMmUsers] = useState<Record<string, User>>({});
  const [loadingPostList, setLoadingPostList] = useState(false);
  const { authUser, chainUsers, isChainAdmin } = useContext(StoreContext);
  const refScrollRoot = useRef<HTMLDivElement>(null);
  const [refScrollTop, entry] = useIntersectionObserver({
    root: refScrollRoot.current,
  });
  const scrollTop = () => refScrollRoot.current?.scrollTo({ top: 0 });

  useEffect(() => {
    if (!chain || mmData) return;
    if (chain && authUser && !window.nClient) {
      apiChat
        .chatPatchUser()
        .then(async (resp) => {
          const _mmData: Partial<MmData> = { pass: resp.data.chat_pass };
          console.log("chat token", _mmData.pass);
          if (!_mmData.pass) throw new Error("mmData not found");
          // Start client
          window.nClient = new Client(
            VITE_CHAT_SERVER_KEY,
            VITE_CHAT_HOST,
            VITE_CHAT_PORT,
            VITE_CHAT_SSL,
          );
          window.nSession = await window.nClient.authenticateEmail(
            authUser.email,
            _mmData.pass,
            true,
          );
          _mmData.userId = window.nSession.user_id;

          // Join channels
          // await apiChat.chatJoinChannels(chain.uid);

          setMmData(_mmData as MmData);
          let chatRoomIds = chain.chat_room_ids || [];
          if (!chain.chat_room_ids?.length) {
            // console.log("create first channel");
            // const group = await window.nClient.createGroup(window.nSession, {
            //   name: crypto.randomUUID().toString(),
            //   description: "General",
            //   open: true,
            // });
            // await apiChat.chatCreateChannel(chain.uid, group.id!);
            // console.log("create channel", group.id!);
            // chatRoomIds.push(group.id!);
          }
          await getGroups(_mmData as MmData, chatRoomIds);
        })
        .catch((err) => {
          console.error("error window.nClient", err);
          window.nClient = undefined;
        });
    }

    if (window.nClient && chain) {
      console.log("client");
    }
  }, [mmData, chain]);

  const chainChannels = useMemo(() => {
    if (!chain || !chain.chat_room_ids) return [];
    console.log("chainChannels", groups);
    return groups.sort((a, b) =>
      Date.parse(a.create_time!) > Date.parse(b.create_time!) ? 1 : 0,
    );
  }, [groups, chain]);

  /** Sets the channels state and return it too */
  async function getGroups(
    _mmData: MmData,
    chatRoomIDs: string[],
  ): Promise<Group[]> {
    console.log("getChannels start", chatRoomIDs);
    if (!window.nClient) throw "nClient is not available";
    if (!window.nSession) throw "nSession is not available";
    if (!_mmData.userId) throw "Not logged in to chat";

    const _groups: Group[] = [];
    const _mygroups = await window.nClient
      .listUserGroups(window.nSession, _mmData.userId)
      .then((res) => {
        console.log("listUserGroups", res);
        if (!res.user_groups) return [];
        return res.user_groups;
      });
    for (const ch of _mygroups) {
      if (chatRoomIDs?.includes(ch.group!.id!)) {
        _groups.push(ch.group!);
      }
    }
    _groups.sort((a, b) =>
      Date.parse(a.create_time!) > Date.parse(b.create_time!) ? 1 : 0,
    );

    // if no channels are selected select the oldest
    let _selectedGroup = selectedGroup;
    if (!_selectedGroup) {
      _selectedGroup = _groups.at(0) || null;
      if (_selectedGroup) {
        await onSelectGroup(_selectedGroup);
      }
    }
    if (!_selectedGroup) onSelectOldBulkyItems();

    setGroups(_groups);
    return _groups;
  }

  async function onCreateChannel(name: string) {
    if (!chain || !window.nClient || !window.nSession || !mmData) {
      if (!chain) console.error("chain not found");
      if (!window.nClient) console.error("nClient not found");
      if (!window.nSession) console.error("nSession not found");
      if (!mmData) console.error("mmData not found");
      return;
    }
    try {
      console.info("Creating channel", name);
      const group = await window.nClient.createGroup(window.nSession, {
        name: crypto.randomUUID().toString(),
        description: name,
        open: IS_GROUP_OPEN,
      });
      await apiChat.chatCreateChannel(chain.uid, group.id!);
      const _groups = await getGroups(mmData, [
        ...(chain.chat_room_ids || []),
        group.id!,
      ]);
      const _group = _groups.find((c) => c.id == group.id!) || null;

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

  async function onRenameChannel(channel: Group, name: string) {
    if (!chain || !window.nClient || !window.nSession || !mmData) {
      if (!chain) console.error("chain not found");
      if (!window.nClient) console.error("window.nClient not found");
      if (!window.nSession) console.error("window.nSession not found");
      if (!mmData) console.error("mmData not found");
      return;
    }
    try {
      console.info("Updating channel name", name);
      await window.nClient.updateGroup(window.nSession, channel.id!, {
        description: name,
      });
      const _channels = await getGroups(mmData, chain?.chat_room_ids || []);
      setGroups(_channels);
    } catch (err) {
      console.error(err);
    }
  }

  async function onDeleteChannel(channelID: string) {
    console.log(selectedGroup);
    if (!chain || !window.nClient) {
      if (!chain) console.error("chain not found");
      if (!window.nClient) console.error("window.nClient not found");
      if (!window.nSession) console.error("window.nSession not found");
      return;
    }
    try {
      console.info("Deleting channel", channelID);
      await apiChat.chatDeleteChannel(chain.uid, channelID);

      const _channels = groups.filter((c) => c.id != channelID);
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
    if (!window.nClient || !window.nSocket || !selectedGroup) return;

    console.info("deleting post", postID);
    window.nSocket
      ?.removeChatMessage(window.nChannel!.id!, postID)
      .finally(() => {
        reqPostList("current");
      });
  }

  async function onSelectGroup(group: Group) {
    if (window.nSocket && selectedGroup)
      window.nSocket.leaveChat(selectedGroup.id!);

    setSelectedOldBulkyItems(false);
    setSelectedGroup(group);
    console.log("selected group", group.id);
    if (!group || !window.nClient || !window.nSession) return;
    if (!window.nSocket) {
      window.nSocket = window.nClient.createSocket(VITE_CHAT_SSL);
      await window.nSocket.connect(window.nSession, true);
    }
    window.nChannel = await window.nSocket?.joinChat(group.id!, 3, true, false);

    window.nSocket.onchannelmessage = (msg) => {
      console.log("channel message", msg);
      if (msg.channel_id == window.nChannel?.id) reqPostList("current");
    };
    reqPostList("current");
  }

  async function reqPostList(cursor: "previous" | "current") {
    console.log("reqPostList", window.nChannel!.id, window.nChannel);
    if (loadingPostList) return;
    // Don't ask for more posts than the last post
    if (cursor == "previous" && !postList.next_cursor) return;
    setLoadingPostList(true);
    if (!window.nClient || !window.nSession) return;

    const newPosts = await window.nClient.listChannelMessages(
      window.nSession,
      window.nChannel!.id!,
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

  function onScrollTop(lastPostId: string) {
    reqPostList("previous");
  }
  // async function getFile(fileId: string, timestamp: number) {
  //   if (!selectedChannel || !window.nClient) return;
  //   const fileUrl = await window.nClient.getFileUrl(fileId, timestamp);
  //   return fileUrl.toString();
  // }

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
    if (!selectedGroup || !window.nSocket || !window.nClient) return;
    console.log("reqPostList", selectedGroup.id);
    await window.nSocket.writeChatMessage(window.nChannel!.id!, { message });

    await reqPostList("current");
    scrollTop();
  }

  function onClickEnableChat() {
    apiChat.chatPatchUser();
  }

  async function getMmUser(mmUserID: string): Promise<User> {
    const found = mmUsers[mmUserID];
    if (found) return found;
    if (!window.nSession) throw "No session";

    const res = await window.nClient?.getUsers(window.nSession, [mmUserID]);
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
    if (window.nChannel && window.nSocket)
      window.nSocket.leaveChat(window.nChannel.id!);
  }
  function onDeleteChannelSubmit() {
    if (!selectedGroup) return;
    if (selectedGroup) onDeleteChannel(selectedGroup.id!);
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
            ) : window.nClient ? (
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
