import type { User } from "../../../api/types";
import { getPauseDetails } from "./pause-details";

export default function isUserPaused(user: User, chainUID: string): boolean {
  return (
    getPauseDetails(
      user.chains.find((c) => c.chain_uid === chainUID),
      user.paused_until,
    ) !== null
  );
}
