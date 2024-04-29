import { IonItem } from "@ionic/react";
import { Post } from "@mattermost/types/posts";

interface Props {
  post: Post;
  isMe: boolean;
}

export default function ChatPost({ post, isMe }: Props) {
  return (
    <IonItem
      lines="none"
      color="light"
      className={`tw-shrink-0 tw-rounded-tl-2xl tw-rounded-tr-2xl ${
        post.is_following ? "" : "tw-mb-2"
      } ${
        isMe
          ? "tw-rounded-bl-2xl tw-float-right tw-ml-8 tw-mr-4"
          : "tw-rounded-br-2xl tw-mr-8 tw-ml-4 tw-float-left"
      }`}
    >
      <div className="tw-py-2">
        <div className="tw-font-bold">{post.props.username}</div>
        <div>{post.message}</div>
      </div>
    </IonItem>
  );
}
