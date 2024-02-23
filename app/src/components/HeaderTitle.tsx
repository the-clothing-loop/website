import { IonIcon, IonTitle } from "@ionic/react";
import {
  construct,
  constructOutline,
  constructSharp,
  ellipsisHorizontalCircleOutline,
  ellipsisHorizontalSharp,
} from "ionicons/icons";
import { useLongPress } from "use-long-press";

interface Props {
  isChainAdmin: boolean;
  className: string;
  headerText: string;
  onEdit: () => void;
}

export default function HeaderTitle({
  className,
  isChainAdmin,
  headerText,
  onEdit,
}: Props) {
  const longPressHeader = useLongPress(onEdit);

  if (isChainAdmin) {
    return (
      <IonTitle size="large" className={className} {...longPressHeader()}>
        {headerText}

        <IonIcon
          icon={construct}
          className="tw-text-[18px] tw-ml-1.5 !tw-text-blue tw-cursor-pointer"
          onClick={onEdit}
        />
      </IonTitle>
    );
  }

  return (
    <IonTitle size="large" className={className}>
      {headerText}
    </IonTitle>
  );
}
