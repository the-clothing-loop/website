import { IonIcon } from "@ionic/react";
import { pauseCircle, chevronForwardOutline } from "ionicons/icons";
import { User } from "../../api/typex2";

interface Props {
  user: User;
  routeIndex: number;
  isPaused: boolean;
}

export default function UserLink({ user, routeIndex, isPaused }: Props) {
  return (
    <div className="!tw-font-bold tw-text-medium tw-flex tw-flex-row tw-items-baseline tw-text-xs tw-w-full">
      {isPaused ? (
        <IonIcon
          className="tw-translate-y-px tw-w-4 tw-h-4 tw-min-w-[16px] tw-me-[3px]"
          icon={pauseCircle}
        />
      ) : (
        <span className="tw-me-[3px]">{"#" + (routeIndex + 1)}</span>
      )}
      <span
        className={`ion-text-ellipsis tw-text-sm tw-flex-grow tw-block ${
          isPaused ? "tw-text-medium" : "tw-text-dark"
        }`}
      >
        {user.name}
      </span>
      <IonIcon
        icon={chevronForwardOutline}
        className="tw-translate-y-0.5 tw-px-0.5 tw-min-w-[12px] tw-w-3"
      ></IonIcon>
    </div>
  );
}
