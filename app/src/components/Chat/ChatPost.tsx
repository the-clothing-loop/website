import { Post } from "@mattermost/types/posts";
import { User } from "../../api/types";
import { useEffect, useMemo, useState } from "react";
import { UserProfile } from "@mattermost/types/users";
import { useLongPress } from "use-long-press";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonRoute,
  IonText,
} from "@ionic/react";
import { ellipsisHorizontal, time } from "ionicons/icons";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const longPress = useLongPress((e) => {
    props.onLongPress(props.post.id);
  });
  const [username, setUsername] = useState("");
  const [isMe, setIsMe] = useState(false);
  const [imageURL, setImageURL] = useState("");
  //const [user, setUser] = useState(User)
  const message = useMemo(() => {
    console.log(props.post);
    props.getMmUser(props.post.user_id).then((res) => {
      const user = props.users.find((u) => res.username === u.uid);
      setUsername(user ? user.name : res.username);
      setIsMe(user?.uid === props.authUser?.uid);
    });
    fetchImage()
      .then((im) => {
        if (im) setImageURL(im);
      })
      .catch((err) => {
        console.error(err);
      });
    let message = props.post.message;
    for (let user of props.users) {
      message = message.replaceAll(user.uid, user.name);
    }
    return message;
  }, [props.users, props.post]);

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
  let shouldExpandText = message.length > 50 || message.split("\n").length > 4;

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
        className={"tw-rounded-tl-xl tw-rounded-tr-xl tw-inline-block tw-rounded-br-xl tw-mx-4 tw-relative".concat(
          isMe ? " tw-bg-purple-shade" : " tw-bg-light",
        )}
      >
        <img
          className="tw-mb-4 -tw-px-2 tw-rounded-tl-xl tw-rounded-tr-xl tw-inline-block tw-max-h-96"
          src={imageURL}
        ></img>
        {username ? (
          <div className="tw-text-xs tw-font-bold tw-px-2 tw-absolute tw-bottom-32 tw-text-white">
            {username}
          </div>
        ) : null}
        <IonItem
          lines="none"
          routerLink={"/address/" + props.authUser?.uid}
          className="tw-my-0 -tw-mx-4 tw-p-2 "
          color="background"
        >
          <div>
            <div className="tw-mb-2">
              <h3 className="ion-no-margin !tw-font-bold tw-text-xs tw-leading-5">
                {t("address")}
              </h3>
              <p className="ion-text-wrap tw-opacity-60 tw-text-xs">
                {props.authUser?.address}
              </p>
            </div>
            {shouldExpandText ? (
              <span className="tw-mt-[-3px] tw-text-xs tw-leading-5 tw-font-semibold tw-block tw-text-primary">
                {t("readMore")}
              </span>
            ) : null}
            <div className="tw-mb-2">
              <h3 className="ion-no-margin !tw-font-bold tw-text-xs tw-leading-5">
                {t("description")}
              </h3>
              <p
                className={`ion-text-wrap tw-opacity-60 tw-text-xs ${
                  shouldExpandText ? "tw-max-h-[46px]" : ""
                }`}
              >
                {message}
              </p>
            </div>
          </div>
        </IonItem>
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
        className={"tw-rounded-tl-xl tw-rounded-tr-xl tw-inline-block tw-p-2 tw-rounded-br-xl tw-mx-4".concat(
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
