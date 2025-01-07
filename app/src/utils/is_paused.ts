import { Dayjs } from "dayjs";
import { UID } from "../api/types";
import { User } from "../api/typex2";
import dayjs from "../dayjs";

export default function IsPaused(
  user: User | null,
  currentChainUID: UID | undefined,
): boolean {
  if (user === null) return false;
  if (currentChainUID) {
    const uc = user.chains.find((uc) => uc.chain_uid === currentChainUID);
    if (uc && uc.is_paused) return true;
  }
  if (!user.paused_until) return false;
  const paused = dayjs(user.paused_until);

  return paused.isAfter(dayjs());
}

export interface IsPausedHowResult {
  /** is paused for user */
  user: false | Dayjs;
  /** is paused for this chain */
  chain: boolean;
  /** is paused sum */
  sum: boolean;
}

export function IsPausedHow(
  user: User | null,
  currentChainUID: UID | undefined,
): IsPausedHowResult {
  if (user === null) return { user: false, chain: false, sum: false };

  let userPaused = user.paused_until ? dayjs(user.paused_until) : false;
  if (userPaused && !userPaused.isAfter(dayjs())) userPaused = false;

  let userChainPaused = false;
  if (currentChainUID) {
    const uc = user.chains.find((uc) => uc.chain_uid === currentChainUID);
    if (uc && uc.is_paused) userChainPaused = true;
  }

  return {
    user: userPaused,
    chain: userChainPaused,
    sum: Boolean(userPaused) || userChainPaused,
  };
}
