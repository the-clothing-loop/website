import { Post } from "@mattermost/types/posts";
import { User } from "../../api/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLongPress } from "use-long-press";
import { IonButton, IonIcon, IonItem, IonModal, IonText } from "@ionic/react";
import { ellipsisVertical } from "ionicons/icons";
import { useTranslation } from "react-i18next";

export interface ChatPostProps {
  post: Post;
  users: User[];
  authUser: User | null | undefined;
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

  const { message, title, body } = useMemo(() => {
    const user = props.users.find((u) => u.chat_id === props.post.user_id);
    // console.log("post find user", user?.name, user?.uid);
    setUsername(user?.name || props.post.user_id);
    setIsMe(user ? user.uid === props.authUser?.uid : false);
    let message = props.post.message;
    for (let user of props.users) {
      message = message.replaceAll(user.uid, user.name);
    }
    const [title = "", body = ""] = message.split("\n\n", 2);
    return { message, title, body };
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

  const shouldExpandText = body.length > 150;
  const isEditable = isMe || props.isChainAdmin;

  if (props.post.type != "") {
    if (props.authUser?.is_root_admin) {
      return (
        <div className="tw-flex tw-justify-center">
          <div
            className="tw-rounded tw-max-w-xs tw-text-center tw-text-sm tw-p-1 tw-my-2 tw-opacity-70 focus:tw-opacity-100 tw-bg-light"
            tabIndex={-1}
          >
            {message}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  if (imageURL) {
    // console.log("Post image", "message", message, "title", title, "body", body);
    return (
      <>
        <div
          className={"tw-mb-2 tw-flex tw-justify-start".concat(
            isMe ? " tw-flex-row-reverse" : " tw-flex-row",
          )}
          {...(isEditable ? longPress : {})}
        >
          <div
            className={"tw-max-w-full tw-overflow-hidden tw-rounded-tl-xl tw-rounded-tr-xl tw-inline-block tw-px-2 tw-py-1 tw-mx-4".concat(
              isMe
                ? " tw-bg-purple-shade tw-rounded-bl-xl"
                : " tw-bg-light tw-rounded-br-xl",
            )}
          >
            <div className="tw-rounded-tl-xl tw-rounded-tr-xl tw-rounded-br-xl tw-flex tw-justify-between tw-items-center">
              <div className="tw-p-1 tw-text-xs tw-font-bold">{username}</div>

              {isEditable ? (
                <IonButton
                  onClick={() => props.onLongPress(props.post.id)}
                  color="transparent"
                  className="tw-sticky tw-top-0 tw-opacity-70 tw-p-0 tw-bg-light-shade tw-rounded-full"
                  size="small"
                  type="button"
                >
                  <IonIcon
                    slot="icon-only"
                    size="small"
                    color="dark"
                    icon={ellipsisVertical}
                  />
                </IonButton>
              ) : null}
            </div>
            <div className="tw-relative">
              <img
                className="-tw-px-2 tw-block tw-max-h-60 tw-min-h-40 tw-bg-medium-shade tw-text-background"
                src={imageURL}
                alt={title}
              ></img>
              {username ? (
                <div className="tw-absolute tw-bottom-0 tw-text-sm tw-w-full tw-font-bold tw-px-2 tw-text-[#fff] tw-bg-[#000]/20">
                  {title}
                </div>
              ) : null}
            </div>
            <IonItem
              lines="none"
              routerLink={"/address/" + props.authUser?.uid}
              className="tw-my-0 tw-ps-2"
              color="background"
              style={{ "--padding-start": "0" }}
            >
              <div className="tw-py-2">
                <h3 className="ion-no-margin !tw-font-bold tw-text-xs tw-leading-5">
                  {t("address")}
                </h3>
                <p className="ion-text-wrap tw-opacity-60 tw-text-xs">
                  {props.authUser?.address}
                </p>
              </div>
            </IonItem>
            {body != "" ? (
              <IonItem
                color="background"
                lines="none"
                className={`tw-my-0 -tw-mx-4 tw-px-2 ${
                  shouldExpandText ? "-tw-mb-3" : "tw-mb-2"
                } `}
              >
                <div>
                  <h3 className="ion-no-margin !tw-font-bold tw-text-xs tw-leading-5">
                    {t("description")}
                  </h3>
                  <p
                    className={`ion-text-wrap tw-opacity-60 tw-text-xs tw-overflow-hidden ${
                      shouldExpandText ? "tw-max-h-[48px]" : ""
                    }`}
                  >
                    {body}
                  </p>
                </div>
              </IonItem>
            ) : null}
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
        </div>
        <IonModal
          ref={refModalDesc}
          initialBreakpoint={0.6}
          breakpoints={[0, 0.6, 1]}
        >
          <div className="ion-padding tw-text-lg tw-leading-6">
            <h1 className="tw-mt-0">{title}</h1>
            {body}
          </div>
        </IonModal>
      </>
    );
  }

  return (
    <div
      className={"tw-mb-2 tw-flex tw-justify-start".concat(
        isMe ? " tw-flex-row-reverse" : " tw-flex-row",
      )}
      {...(isEditable ? longPress : {})}
    >
      <div
        className={"tw-max-w-full tw-overflow-hidden tw-rounded-tl-xl tw-rounded-tr-xl tw-inline-block tw-p-2".concat(
          isMe
            ? "  tw-me-4 tw-bg-purple-shade tw-rounded-bl-xl"
            : "  tw-ms-4 tw-bg-light tw-rounded-br-xl",
        )}
      >
        {username ? (
          <div className="tw-text-xs tw-font-bold">{username}</div>
        ) : null}
        <div className="tw-w-full tw-overflow-hidden tw-text-ellipsis tw-whitespace-break-spaces tw-break-normal">
          {message}
        </div>
      </div>
      {isEditable ? (
        <div className="relative">
          <IonButton
            onClick={() => props.onLongPress(props.post.id)}
            color="transparent"
            className="tw-sticky tw-top-0 tw-opacity-70"
            size="small"
            type="button"
          >
            <IonIcon
              slot="icon-only"
              size="small"
              color="dark"
              icon={ellipsisVertical}
            />
          </IonButton>
        </div>
      ) : null}
    </div>
  );
}
