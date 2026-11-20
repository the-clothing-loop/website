import type { UID, User } from "../../../api/types";
import { getPauseDetails } from "./pause-details";

export function getPausedDate(user: User, chainUID: UID): string {
  const chain = user.chains.find((chain) => chain.chain_uid === chainUID);
  const pause = getPauseDetails(chain, user.paused_until);
  if (pause?.kind !== "since" || !pause.date) return "";
  const date = new Date(pause.date);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function sortPausedMembers(
  users: User[],
  chainUID: UID,
  sortBy: "name" | "email" | "date" | "paused",
): User[] {
  return [...users].sort((a, b) => {
    if (sortBy === "name" || sortBy === "email") {
      return (a[sortBy] ?? "").localeCompare(b[sortBy] ?? "");
    }
    const timestamp = (user: User) => {
      const chain = user.chains.find((chain) => chain.chain_uid === chainUID);
      const value =
        sortBy === "paused" ? getPausedDate(user, chainUID) : chain?.created_at;
      const date = value ? Date.parse(value) : NaN;
      return Number.isNaN(date) ? -Infinity : date;
    };
    const left = timestamp(a);
    const right = timestamp(b);
    return left === right ? 0 : left > right ? -1 : 1;
  });
}
