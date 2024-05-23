import { Post } from "@mattermost/types/posts";
import { User } from "../../api/types";
import { useEffect, useMemo, useState } from "react";
import { UserProfile } from "@mattermost/types/users";
import { useLongPress } from "use-long-press";
import { IonButton, IonIcon } from "@ionic/react";
import { ellipsisHorizontal, time } from "ionicons/icons";
import { c } from "vitest/dist/reporters-5f784f42";

export interface ChatPostProps {
  post: Post;
  users: User[];
  authUser: User | null | undefined;
  getMmUser: (id: string) => Promise<UserProfile>;
  getFile: (fileId: string, timestamp: number) => void;
  isChainAdmin: boolean;
  onLongPress: (id: string) => void;
}

export default function ChatPost(props: ChatPostProps) {
  const longPress = useLongPress((e) => {
    props.onLongPress(props.post.id);
  });
  const [username, setUsername] = useState("");
  const [isMe, setIsMe] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const message = useMemo(() => {
    props.getMmUser(props.post.user_id).then((res) => {
      const user = props.users.find((u) => res.username === u.uid);
      setUsername(user ? user.name : res.username);
      setIsMe(user?.uid === props.authUser?.uid);
    });

    let message = props.post.message;
    for (let user of props.users) {
      message = message.replaceAll(user.uid, user.name);
    }
    return message;
  }, [props.users, props.post]);
  useEffect(() => {
    fetchImage()
      .then((im) => {
        if (im) setImageURL(im);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  async function fetchImage() {
    if (props.post.file_ids) {
      const fileid = props.post.file_ids[0];
      const timestamp = props.post.create_at;
      try {
        const _image = await props.getFile(fileid, timestamp);
        return _image as unknown as string;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  }

  return props.post.type != "" ? (
    <div className="tw-flex tw-justify-center">
      <div
        className="tw-rounded tw-max-w-xs tw-text-center tw-text-sm tw-p-1 tw-my-2 tw-opacity-70 focus:tw-opacity-100 tw-bg-light"
        tabIndex={-1}
      >
        {message}
      </div>
    </div>
  ) : imageURL ? (
    <div className="tw-mb-2" {...(props.isChainAdmin ? longPress : {})}>
      <div
        className={"tw-rounded-tl-xl tw-rounded-tr-xl tw-inline-block tw-p-2 tw-rounded-br-xl tw-ml-4".concat(
          isMe ? " tw-bg-purple-shade" : " tw-bg-light",
        )}
      >
        {username ? (
          <div className="tw-text-xs tw-font-bold">{username}</div>
        ) : null}
        <div>{message}</div>
        <img src={imageURL}></img>
      </div>
      <IonButton
        onClick={() => props.onLongPress(props.post.id)}
        color="transparent"
        className="tw-opacity-70"
        type="button"
      >
        <IonIcon color="dark" icon={ellipsisHorizontal} />
      </IonButton>
    </div>
  ) : (
    <div className="tw-mb-2" {...(props.isChainAdmin ? longPress : {})}>
      <div
        className={"tw-rounded-tl-xl tw-rounded-tr-xl tw-inline-block tw-p-2 tw-rounded-br-xl tw-ml-4".concat(
          isMe ? " tw-bg-purple-shade" : " tw-bg-light",
        )}
      >
        {username ? (
          <div className="tw-text-xs tw-font-bold">{username}</div>
        ) : null}
        <div>{message}</div>
      </div>
      <IonButton
        onClick={() => props.onLongPress(props.post.id)}
        color="transparent"
        className="tw-opacity-70"
        type="button"
      >
        <IonIcon color="dark" icon={ellipsisHorizontal} />
      </IonButton>
    </div>
  );
}
