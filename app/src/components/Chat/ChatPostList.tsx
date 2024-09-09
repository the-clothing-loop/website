import { PaginatedPostList } from "@mattermost/types/posts";
import ChatPost from "./ChatPost";
import { User } from "../../api/types";
import { useState } from "react";
import { IonActionSheet, useIonAlert } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { ChannelMessageList, User as UserProfile } from "@heroiclabs/nakama-js";

interface Props {
  postList: ChannelMessageList;
  isChainAdmin: boolean;
  authUser: User | null | undefined;
  getMmUser: (id: string) => Promise<UserProfile>;
  // getFile: (fileId: string, timestamp: number) => void;
  chainUsers: User[];
  onDeletePost: (id: string) => void;
}

export default function ChatPostList(props: Props) {
  const { t } = useTranslation();
  const [isPostActionSheetOpen, setIsPostActionSheetOpen] = useState<
    string | null
  >(null);
  const [presentAlert] = useIonAlert();

  function handlePostOptionSelect(value: "delete") {
    if (value == "delete") {
      const postID = isPostActionSheetOpen;
      if (!postID) return;
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
            onLongPress={(id) => setIsPostActionSheetOpen(id)}
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
        buttons={[
          {
            text: t("delete"),
            role: "destructive",
            handler: () => handlePostOptionSelect("delete"),
          },
          {
            text: t("cancel"),
            role: "cancel",
          },
        ]}
      ></IonActionSheet>
    </>
  );
}
