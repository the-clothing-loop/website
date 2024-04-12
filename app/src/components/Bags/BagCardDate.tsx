import { Dayjs } from "dayjs";

interface BagCardDateProps {
  bagUpdatedAt: Dayjs;
  isBagTooOldMe: boolean;
  isBagTooOldHost: boolean;
  classNameOverride?: string;
}
export default function BagCardDate({
  bagUpdatedAt,
  isBagTooOldMe,
  isBagTooOldHost,
  classNameOverride,
}: BagCardDateProps) {
  return (
    <div
      className={
        classNameOverride ||
        "tw-text-sm tw-block tw-absolute tw-z-10 tw-top-[5px] tw-left-[10px] tw-text-[#fff]"
      }
    >
      {bagUpdatedAt.toDate().toLocaleDateString()}
      {isBagTooOldMe || isBagTooOldHost ? (
        <span
          className={"tw-h-2 tw-w-2 tw-rounded-full tw-inline-block tw-ms-[3px] tw-mb-[1px]".concat(
            isBagTooOldMe ? " tw-bg-danger" : " tw-bg-warning",
          )}
        ></span>
      ) : null}
    </div>
  );
}
