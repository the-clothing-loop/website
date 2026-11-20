import type { User } from "../../../api/types";

// The host's Paused table contains only pauses in the selected loop.
export default function isUserPaused(user: User, chainUID: string): boolean {
  return user.chains.some((c) => c.chain_uid === chainUID && c.is_paused);
}
