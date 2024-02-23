import { IonCard, IonRouterLink } from "@ionic/react";
import { Bag, User } from "../../api";
import { useBagTooOld } from "./bag.hook";
import BagSVG from "./Svg";
import { useHistory } from "react-router";

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
      <div
        key="old"
        className={`tw-text-sm tw-block tw-absolute tw-z-10 tw-top-[5px] tw-left-[10px] ${
          isBagTooOldMe ? "tw-text-[#fdaab5]" : "tw-text-[#fff]"
        }`}
      >
        {bagUpdatedAt.toDate().toLocaleDateString()}
        {isBagTooOldMe || isBagTooOldHost ? (
          <span className="tw-bg-danger tw-h-2 tw-w-2 tw-rounded-full tw-inline-block tw-ms-[3px] tw-mb-[1px]"></span>
        ) : null}
      </div>
      <div className="tw-relative tw-p-0 tw-pt-0 tw-overflow-hidden">
        <div className="tw-scale-100 tw-transition-transform hover:tw-scale-105 tw-cursor-pointer">
          <BagSVG bag={bag} />
        </div>
      </div>
    </IonCard>
  );
}
