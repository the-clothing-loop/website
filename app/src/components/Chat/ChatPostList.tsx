import { PaginatedPostList } from "@mattermost/types/posts";
import ChatPost from "./ChatPost";
import { User } from "../../api/types";
import { useContext, useMemo, useState } from "react";
import { ActionSheetButton, IonActionSheet, useIonAlert } from "@ionic/react";
import { useTranslation } from "react-i18next";
import {
  ChannelMessage,
  ChannelMessageList,
  User as UserProfile,
} from "@heroiclabs/nakama-js";
import { StoreContext } from "../../stores/Store";

interface Props {
  postList: ChannelMessageList;
  isChainAdmin: boolean;
  authUser: User | null | undefined;
  getMmUser: (id: string) => Promise<UserProfile>;
  // getFile: (fileId: string, timestamp: number) => void;
  chainUsers: User[];
  onDeletePost: (id: string) => void;
  onBanSender: (id: string) => void;
}

export interface PostActionSheetOpen {
  post: ChannelMessage;
  isMe: boolean;
}

export default function ChatPostList(props: Props) {
  const { t } = useTranslation();
  const [isPostActionSheetOpen, setIsPostActionSheetOpen] =
    useState<PostActionSheetOpen | null>(null);
  const [presentAlert] = useIonAlert();
  const { isChainAdmin, authUser } = useContext(StoreContext);

  const postActionButtons = useMemo(() => {
    const list: ActionSheetButton<any>[] = [
      {
        text: t("delete"),
        role: "destructive",
        handler: () => handlePostOptionSelect("delete"),
      },
    ];

    if (isChainAdmin && isPostActionSheetOpen?.isMe === false) {
      list.push({
        text: t("ban"),
        role: "destructive",
        handler: () => handlePostOptionSelect("ban"),
      });
    }
    list.push({
      text: t("cancel"),
      role: "cancel",
    });
    return list;
  }, [isChainAdmin, isPostActionSheetOpen]);

  function handlePostOptionSelect(value: "delete" | "ban") {
    if (value == "delete") {
      if (!isPostActionSheetOpen) return;
      const postID = isPostActionSheetOpen.post.message_id!;
      presentAlert({
        header: "Delete post?",
        buttons: [
          {
            text: t("cancel"),
          },
          {
            role: "destructive",
            text: t("delete"),
            handler: () => props.onDeletePost(postID),
          },
        ],
      });
    } else if (value == "ban") {
      if (!isPostActionSheetOpen) return;
      const postUser = isPostActionSheetOpen.post.sender_id!;
      presentAlert({
        header: "Ban user?",
        buttons: [
          {
            text: t("cancel"),
          },
          {
            role: "destructive",
            text: t("ban"),
            handler: () => props.onBanSender(postUser),
          },
        ],
      });
    }
  }

  return (
    <>
      {props.postList.messages?.map((post, i) => {
        // const prevPostID = props.postList.order[i + 1];
        // const prevPost = prevPostID ? props.postList.posts[prevPostID] : null;
        return (
          <ChatPost
            isChainAdmin={props.isChainAdmin}
            authUser={props.authUser}
            onLongPress={(o) => setIsPostActionSheetOpen(o)}
            post={post}
            getMmUser={props.getMmUser}
            // getFile={props.getFile}
            key={post.message_id}
            users={props.chainUsers}
          />
        );
      })}

      <IonActionSheet
        isOpen={isPostActionSheetOpen !== null}
        onDidDismiss={() => setIsPostActionSheetOpen(null)}
        buttons={postActionButtons}
      ></IonActionSheet>
    </>
  );
}
