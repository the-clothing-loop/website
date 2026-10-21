import type { User } from "../../../api/types";

export default function isUserPaused(user: User, chainUID: string): boolean {
  return (
    user.chains.some((uc) => uc.chain_uid === chainUID && uc.is_paused) ||
    (!!user.paused_until && Date.parse(user.paused_until) > Date.now())
  );
}
