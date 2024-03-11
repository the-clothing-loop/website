import { IonCard, IonRouterLink } from "@ionic/react";
import { Bag, User } from "../../api";
import { useBagTooOld } from "./bag.hook";
import BagSVG from "./Svg";
import { useHistory } from "react-router";
import BagCardDate from "./BagCardDate";

interface Props {
  authUser: User | null;
  isChainAdmin: boolean;
  bag: Bag;
}
export default function AddressBagCard({ authUser, isChainAdmin, bag }: Props) {
  const history = useHistory();
  function handleClickItem() {
    history.replace("/bags", { bag_id: bag.id });
  }

  const { bagUpdatedAt, isBagTooOldMe, isBagTooOldHost } = useBagTooOld(
    authUser,
    isChainAdmin,
    bag,
  );
  return (
    <IonCard
      className="ion-no-margin tw-relative tw-overflow-visible tw-rounded-none tw-text-[0px]"
      onClick={handleClickItem}
    >
      <BagCardDate
        bagUpdatedAt={bagUpdatedAt}
        isBagTooOldMe={isBagTooOldMe}
        isBagTooOldHost={isBagTooOldHost}
      />
      <div className="tw-relative tw-p-0 tw-pt-0 tw-overflow-hidden">
        <div className="tw-scale-100 tw-transition-transform hover:tw-scale-105 tw-cursor-pointer">
          <BagSVG bag={bag} />
        </div>
      </div>
    </IonCard>
  );
}
