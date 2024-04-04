import { UID, User } from "../api/types";
import dayjs from "../dayjs";

export default function isPaused(
  user: User | null,
  currentChainUID: UID | undefined,
): boolean {
  if (user === null) return false;
  if (currentChainUID) {
    const uc = user.chains.find((uc) => uc.chain_uid === currentChainUID);
    if ("d34705e7-a1ac-45a4-ac34-ef1ec00f124f" === user?.uid)
      console.log("isPaused", uc?.is_paused, currentChainUID, uc);
    if (uc && uc.is_paused) return true;
  }
  if (!user.paused_until) return false;
  const paused = dayjs(user.paused_until);

  return paused.isAfter(dayjs());
}
