import { IonItem } from "@ionic/react";
import { Post } from "@mattermost/types/posts";
import { User } from "../../api/types";
import { useMemo } from "react";

interface Props {
  post: Post;
  isMe: boolean;
  users: User[];
  prevPost: Post | null;
}

export default function ChatPost({ post, isMe, users, prevPost }: Props) {
  const { username, message } = useMemo(() => {
    let username = post.props.username;
    let message = post.message;
    for (let user of users) {
      if (user.uid === post.props.username) {
        username = user.name;
      }
      message = message.replaceAll(user.uid, user.name);
    }
    return { username, message };
  }, [users, post]);

  const isSameUserAsPrev = post.user_id === prevPost?.user_id;

  return (
    <>
      {!isSameUserAsPrev ? (
        <div className="tw-sticky tw-top-0 tw-font-bold tw-text-center tw-bg-[#ffffffa0]">
          {username}
        </div>
      ) : null}
      {post.type != "" ? (
        <div className="tw-flex tw-justify-center">
          <div className="tw-rounded tw-bg-light tw-max-w-xs tw-text-center tw-p-1 tw-my-2">
            {message}
          </div>
        </div>
      ) : (
        <div className={` tw-shrink-0  ${post.is_following ? "" : "tw-mb-2"} `}>
          <div
            className={`tw-rounded-tl-2xl tw-rounded-tr-2xl tw-bg-light tw-p-2 ${
              isMe
                ? "tw-rounded-bl-2xl tw-float-right tw-ml-8 tw-mr-4"
                : "tw-rounded-br-2xl tw-mr-8 tw-ml-4 tw-float-left"
            }`}
          >
            {message}
          </div>
        </div>
      )}
    </>
  );
}
