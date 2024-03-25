import { IonItem, IonText, IonIcon } from "@ionic/react";
import { t } from "i18next";
import { shield, pauseCircleSharp, bagHandle } from "ionicons/icons";
import { Bag, User } from "../../api/types";
import isPaused from "../../utils/is_paused";

interface Props {
  user: User;
  bags: Bag[];
  isMe: boolean;
  isHost: boolean;
  isAddressPrivate: boolean;
  number: number;
  routerLink: string | undefined;
}
export default function AddressListItem({
  user,
  isMe,
  bags,
  isHost,
  isAddressPrivate,
  number,
  routerLink,
}: Props) {
  const isUserPaused = isPaused(user.paused_until);
  return (
    <IonItem
      lines="full"
      routerLink={routerLink}
      color={isUserPaused ? "light" : undefined}
    >
      <IonText className="ion-text-ellipsis tw-my-1.5">
        <h5
          className={`ion-no-margin ${
            isMe ? "tw-text-primary" : isUserPaused ? "tw-text-medium" : ""
          }`}
        >
          {user.name}

          {isHost ? (
            <IonIcon
              icon={shield}
              color="medium"
              className="tw-w-4 tw-h-4 tw-m-0 tw-ml-[5px] tw-align-text-top"
            />
          ) : null}
        </h5>
        <span className="tw-opacity-60">
          {isUserPaused ? (
            <small>{t("paused")}</small>
          ) : isAddressPrivate ? (
            <small>&nbsp;</small>
          ) : (
            <small>{user.address}</small>
          )}
        </span>
      </IonText>
      <IonText
        slot="start"
        color="medium"
        className="!tw-font-bold tw-w-[30px] tw-whitespace-nowrap"
      >
        {isUserPaused ? (
          <IonIcon
            icon={pauseCircleSharp}
            color="medium"
            className="tw-w-6 tw-h-6 tw-m-0 tw-align-text-top "
          />
        ) : (
          <span>{"#" + number}</span>
        )}
      </IonText>
      <div
        slot="end"
        style={{
          width: bags.length < 4 ? 0 : 20 * Math.floor(bags.length / 2),
          paddingBottom: bags.length < 4 ? 20 : 0,
        }}
        className="tw-flex tw-flex-col tw-h-10 tw-flex-wrap-reverse tw-items-end"
      >
        {bags.map((b) => (
          <IonIcon
            icon={bagHandle}
            style={{ color: b.color }}
            className="tw-m-0.5"
            key={b.id}
          />
        ))}
      </div>
    </IonItem>
  );
}
