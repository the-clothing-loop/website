import ChatPost from "./ChatPost";
import { User } from "../../api/types";
import { useContext, useMemo, useState } from "react";
import {
  ActionSheetButton,
  IonActionSheet,
  IonIcon,
  useIonAlert,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import {
  ChannelMessage,
  ChannelMessageList,
  User as UserProfile,
} from "@heroiclabs/nakama-js";
import { StoreContext } from "../../stores/Store";
import { chatbubblesOutline } from "ionicons/icons";

interface Props {
  postList: ChannelMessageList;
  isChainAdmin: boolean;
  authUser: User | null | undefined;
  getMmUser: (id: string) => Promise<UserProfile>;
  // getFile: (fileId: string, timestamp: number) => void;
  chainUsers: User[];
  onDeletePost: (id: string) => void;
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
      {
        text: t("cancel"),
        role: "cancel",
      },
    ];
    return list;
  }, [isChainAdmin, isPostActionSheetOpen]);

  function handlePostOptionSelect(value: "delete") {
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

      {props.postList.messages?.length !== 0 ? null : (
        <div className="tw-w-full tw-h-screen tw-flex tw-justify-center tw-items-center">
          <div className="tw-text-center tw-relative">
            <IonIcon icon={chatbubblesOutline} className="tw-text-6xl" />
            <h1>Start Chatting</h1>
          </div>
        </div>
      )}

      <IonActionSheet
        isOpen={isPostActionSheetOpen !== null}
        onDidDismiss={() => setIsPostActionSheetOpen(null)}
        buttons={postActionButtons}
      ></IonActionSheet>
    </>
  );
}
