import { StoreContext } from "../../stores/Store";
import ChatInput from "./ChatInput";
import { IonActionSheet, useIonAlert } from "@ionic/react";
import { useTranslation } from "react-i18next";
import type { PostList } from "@mattermost/types/posts";
import { User } from "../../api/types";
import ChatPost from "./ChatPost";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import { UserProfile } from "@mattermost/types/users";
import { OnSendMessageWithImage } from "../../pages/Chat";

interface Props {
  postList: PostList;
  authUser: User;
  getMmUser: (id: string) => Promise<UserProfile>;
  getFile: (fileId: string, timestamp: number) => void;
  onDeletePost: (id: string) => void;
  onScrollTop: (topPostId: string) => void;
  onSendMessage: (msg: string) => Promise<void>;
  onSendMessageWithImage: OnSendMessageWithImage;
}

// This follows the controller / view component pattern
export default function ChatWindow(props: PropsWithChildren<Props>) {
  const { t } = useTranslation();
  const { authUser, isChainAdmin, chain, chainUsers } =
    useContext(StoreContext);
  const slowTriggerScrollTop = useDebouncedCallback(() => {
    const lastPostId = props.postList.order.at(-1);
    if (lastPostId) {
      console.log("last post", lastPostId);
      props.onScrollTop(lastPostId);
    }
  }, 1000);
  const refScrollRoot = useRef<HTMLDivElement>(null);
  const [refScrollTop, entry] = useIntersectionObserver({
    root: refScrollRoot.current,
  });

  const [setIsChannelActionSheetOpen] = useState(false);
  const [isPostActionSheetOpen, setIsPostActionSheetOpen] = useState<
    string | null
  >(null);
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    if (entry?.isIntersecting) {
      console.log("Intersecting");
      slowTriggerScrollTop();
    }
  }, [entry?.isIntersecting]);

  function onSendMessageWithCallback(message: string) {
    return props.onSendMessage(message).then(() => {
      refScrollRoot.current?.scrollTo({
        top: 0,
      });
    });
  }

  function onSendMessageWithImage(message: string, image: File) {
    return props.onSendMessageWithImage(message, image).then(() => {
      refScrollRoot.current?.scrollTo({
        top: 0,
      });
    });
  }

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
    <div className="tw-relative tw-h-full tw-flex tw-flex-col">
      <div className="tw-shrink-0 w-full">{props.children}</div>
      <div
        ref={refScrollRoot}
        className="tw-flex-grow tw-flex tw-flex-col-reverse tw-overflow-y-auto"
      >
        {props.postList.order.map((postID, i) => {
          const post = props.postList.posts[postID];
          // const prevPostID = props.postList.order[i + 1];
          // const prevPost = prevPostID ? props.postList.posts[prevPostID] : null;
          return (
            <ChatPost
              isChainAdmin={isChainAdmin}
              authUser={authUser}
              onLongPress={(id) => setIsPostActionSheetOpen(id)}
              post={post}
              getMmUser={props.getMmUser}
              getFile={props.getFile}
              key={post.id}
              users={chainUsers}
            />
          );
        })}
        <span key="top" ref={refScrollTop}></span>
      </div>
      <ChatInput
        onSendMessage={onSendMessageWithCallback}
        onSendMessageWithImage={onSendMessageWithImage}
      />
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
    </div>
  );
}
