import { Post } from "@mattermost/types/posts";
import { BulkyItem, User } from "../../api/types";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { UserProfile } from "@mattermost/types/users";
import { useLongPress } from "use-long-press";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonModal,
  IonText,
} from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import { useTranslation } from "react-i18next";
import { i } from "vitest/dist/reporters-5f784f42";

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
  const refModalDesc = useRef<HTMLIonModalElement>(null);
  //const [user, setUser] = useState(User)
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
    fetchPostImage()
      .then((im) => {
        if (im) setImageURL(im);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [props.users, props.post]);

  async function fetchPostImage() {
    if (!props.post.file_ids) return;
    const fileid = props.post.file_ids[0];
    const timestamp = props.post.create_at;
    try {
      const _image = await props.getFile(fileid, timestamp);
      return _image as unknown as string;
    } catch (err) {
      console.error("Error retrieving image from post", err);
      throw err;
    }
  }

  function handleClickReadMore() {
    refModalDesc.current?.present();
  }

  let shouldExpandText = message.length > 150 || message.split("\n").length > 4;

  const bulkyTitle =
    message.indexOf("\n") != -1
      ? message.substring(0, message.indexOf("\n")).trim()
      : "";
  const bulkyMessage =
    message.indexOf("\n") != -1
      ? message.substring(message.indexOf("\n")).trim()
      : "";

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
    <>
      <div className="tw-mb-2" {...(props.isChainAdmin ? longPress : {})}>
        <div
          className={"tw-rounded-tl-xl tw-rounded-tr-xl tw-rounded-br-xl tw-inline-block tw-mx-4 tw-relative".concat(
            isMe ? " tw-bg-purple-shade" : " tw-bg-light",
          )}
        >
          <div className="tw-my-1 tw-rounded-tl-xl tw-rounded-tr-xl tw-rounded-br-xl tw-text-xs tw-font-bold tw-px-2 tw-text-white">
            {username}
          </div>
          <img
            className="-tw-px-2 tw-inline-block tw-max-h-60"
            src={imageURL}
            alt={bulkyTitle}
          ></img>
          {username ? (
            <div className="tw-text-xs tw-font-bold tw-px-2 tw-absolute tw-top-56 tw-text-white">
              {bulkyTitle}
            </div>
          ) : null}
          <IonItem
            lines="none"
            routerLink={"/address/" + props.authUser?.uid}
            className={`tw-my-0 -tw-mx-4 tw-px-2 ${
              shouldExpandText ? "-tw-mb-3" : "tw-mb-1"
            } `}
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

              <div className="tw-mb-2">
                <h3 className="ion-no-margin !tw-font-bold tw-text-xs tw-leading-5">
                  {t("description")}
                </h3>
                <p
                  className={`ion-text-wrap tw-opacity-60 tw-text-xs tw-overflow-hidden ${
                    shouldExpandText ? "tw-max-h-[48px]" : ""
                  }`}
                >
                  {bulkyMessage}
                </p>
              </div>
            </div>
          </IonItem>
          {shouldExpandText ? (
            <IonText
              onClick={
                shouldExpandText ? () => handleClickReadMore() : undefined
              }
              className="tw-pt-2 tw-ml-2 2 tw-h-9 tw-align-middle tw-text-xs tw-leading-5 tw-font-semibold tw-block tw-text-primary"
            >
              {t("readMore")}
            </IonText>
          ) : null}
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
      <IonModal
        ref={refModalDesc}
        initialBreakpoint={0.6}
        breakpoints={[0, 0.6, 1]}
      >
        <div className="ion-padding tw-text-lg tw-leading-6">
          <h1 className="tw-mt-0">{bulkyTitle}</h1>
          {bulkyMessage}
        </div>
      </IonModal>
    </>
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
