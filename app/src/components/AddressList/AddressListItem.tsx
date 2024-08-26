import { IonItem, IonText, IonIcon } from "@ionic/react";
import { shield, pauseCircleSharp, flag } from "ionicons/icons";
import { Bag, User } from "../../api/types";
import TinyBagSvg from "./TinyBagSvg";
//import { Sword } from "lucide-static/"

export interface AddressListItemProps {
  user: User;
  bags: Bag[];
  isMe: boolean;
  isHost: boolean;
  isWarden: boolean;
  isAddressPrivate: boolean;
  number: number;
  routerLink: string | undefined;
  isUserPaused: boolean;
  isChainAdmin: boolean;
}
export default function AddressListItem({
  user,
  isMe,
  bags,
  isHost,
  isWarden,
  isAddressPrivate,
  number,
  routerLink,
  isUserPaused,
  isChainAdmin,
}: AddressListItemProps) {
  return (
    <IonItem
      lines="full"
      routerLink={routerLink}
      detail={routerLink !== undefined}
      color={isMe ? "primary" : isUserPaused ? "light" : undefined}
      id={"ali-" + user.uid}
    >
      <IonText
        slot="start"
        color={isMe ? "light" : "medium"}
        className="!tw-font-bold tw-w-10 tw-mr-2.5 -tw-ml-2 tw-text-right tw-whitespace-nowrap"
      >
        {isHost ? (
          <IonIcon
            icon={shield}
            color={isMe ? undefined : "medium"}
            className="tw-absolute tw-top-1 tw-left-1 tw-w-4 tw-h-4 tw-m-0"
          />
        ) : null}
        {isWarden ? (
          <IonIcon
            icon={flag}
            color={"medium"}
            className="tw-absolute tw-top-1 tw-left-1 tw-w-4 tw-h-4 tw-m-0"
          />
        ) : null}
        {isUserPaused ? (
          <IonIcon
            icon={pauseCircleSharp}
            color={isMe ? "light" : "medium"}
            className="tw-w-6 tw-h-6 tw-m-0 tw-align-text-top"
          />
        ) : (
          <span>
            <small>#</small>
            {number}
          </span>
        )}
      </IonText>
      <div className="tw-flex tw-flex-row tw-w-full">
        <div className="tw-flex-grow tw-flex tw-flex-col tw-justify-center ion-text-ellipsis tw-my-1.5">
          <h5
            className={`ion-no-margin ${
              isMe ? "tw-text-light" : isUserPaused ? "tw-text-medium" : ""
            }`}
          >
            {user.name}
          </h5>
          <span
            className={"tw-inline-block tw-mt-0.5 ion-text-ellipsis tw-h-4 tw-max-w-[220px] tw-text-xs ".concat(
              isMe ? "tw-text-light" : "tw-opacity-60",
            )}
          >
            {isUserPaused ? (
              isChainAdmin || isMe ? (
                <span>{user.address}</span>
              ) : null
            ) : isAddressPrivate ? null : (
              <span>{user.address}</span>
            )}
          </span>
        </div>
        <div className="tw-flex tw-justify-end tw-items-center">
          <div
            dir="rtl"
            className={"tw-grid tw-grid-rows-2 tw-gap-1 tw-mx-0.5"}
            style={{
              gridTemplateColumns: `repeat(${Math.ceil(
                bags.length / 2,
              )}, minmax(0, 1fr))`,
            }}
          >
            {bags.map((b) => (
              <div
                className={"tw-w-4 tw-h-4".concat(
                  isMe ? " tw-shadow-bags" : "",
                )}
                key={b.id}
              >
                <div className="-tw-translate-y-px">
                  <TinyBagSvg bag={b} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </IonItem>
  );
}
