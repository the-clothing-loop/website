import { UserProfile } from "@mattermost/types/users";
import { User } from "../../api/types";
import { PaginatedPostList } from "@mattermost/types/posts";
import { IonActionSheet, useIonAlert } from "@ionic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ChatPost from "./ChatPost";

interface Props {
  isChainAdmin: boolean;
  authUser: User;
  getMmUser: (mmUserID: string) => Promise<UserProfile>;
  postList: PaginatedPostList;
  chainUsers: User[];
  onDeletePost: (postID: string) => void;
  getFile: (fileId: string, timestamp: number) => void;
}

export default function ChatPostList({
  postList,
  isChainAdmin,
  authUser,
  getMmUser,
  chainUsers,
  onDeletePost,
  getFile,
}: Props) {
  const { t } = useTranslation();
  const [isPostActionSheetOpen, setIsPostActionSheetOpen] = useState<
    string | null
  >(null);
  const [presentAlert] = useIonAlert();

  function onPostOptionSelect(value: "delete") {
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
            handler: () => onDeletePost(postID),
          },
        ],
      });
    }
  }

  return (
    <>
      {postList.order.map((postID, i) => {
        const post = postList.posts[postID];
        // const prevPostID = props.postList.order[i + 1];
        // const prevPost = prevPostID ? props.postList.posts[prevPostID] : null;
        return (
          <ChatPost
            isChainAdmin={isChainAdmin}
            authUser={authUser}
            onLongPress={(id) => setIsPostActionSheetOpen(id)}
            post={post}
            getMmUser={getMmUser}
            getFile={getFile}
            key={post.id}
            users={chainUsers}
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
            handler: () => onPostOptionSelect("delete"),
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
