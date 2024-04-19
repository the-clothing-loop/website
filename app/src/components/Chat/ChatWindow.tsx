import { Client4 } from "@mattermost/client";
import { MmData } from "../../stores/Store";
import ChatInput, { SendingMsgState } from "./ChatInput";
import { Channel } from "@mattermost/types/channels";
import { IonIcon } from "@ionic/react";
import { addOutline } from "ionicons/icons";

interface Props {
  channels: Channel[];
  selectedChannel: Channel | null;
}

export default function ChatWindow(props: Props) {
  return (
    <div className="tw-relative tw-h-full tw-flex tw-flex-col">
      <div className="tw-shrink-0 w-full tw-flex tw-px-4 tw-py-2 tw-gap-2 tw-overflow-y-auto tw-bg-[#f4f1f9]">
        {props.channels?.map((cr) => {
          let initials = cr.display_name
            .split(" ")
            .map((word) => word[0])
            .join("");
          return (
            <button
              className="tw-w-14 tw-flex tw-flex-col tw-items-center"
              key={cr.id}
            >
              <div className="tw-font-bold tw-w-12 tw-h-12 tw-rounded-full tw-bg-purple-shade  tw-flex tw-items-center tw-justify-center">
                {initials}
              </div>
              <div className="tw-text-xs tw-text-center tw-truncate tw-max-w-[3.5rem]">
                {cr.display_name}
              </div>
            </button>
          );
        })}
        <button
          key="plus"
          className="tw-rounded-full tw-w-12 tw-h-12 tw-mr-4 tw-bg-light-shade tw-flex tw-shrink-0 tw-items-center tw-justify-center"
        >
          <IonIcon className="tw-text-2xl" src={addOutline} />
        </button>
      </div>
      <div className="tw-flex-grow tw-flex tw-flex-col-reverse tw-overflow-y-auto">
        {/* {postList.order.map((item, i) => {
      const post = postList.posts[item];
      const isMe = post.user_id === authUser?.uid;
      return <ChatPost post={post} key={post.id} isMe={isMe} />;
    })} */}
      </div>
      {/* <ChatInput
    sendingMsg={sendingMsg}
    message={message}
    setMessage={setMessage}
    sendMessage={sendMessage}
  /> */}
    </div>
  );
}
