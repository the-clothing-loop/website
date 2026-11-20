import type { UserChain } from "../../../api/types";
import dayjs from "./dayjs";

export function getPauseDetails(
  chain: UserChain | undefined,
  pausedUntil?: string | null,
): { kind: "since" | "general" | "unknown"; date?: string } | null {
  const now = dayjs();
  if (chain?.is_paused) {
    const since = chain.paused_at ? dayjs(chain.paused_at) : null;
    return since?.isValid() && !since.isAfter(now)
      ? { kind: "since", date: chain.paused_at! }
      : { kind: "unknown" };
  }
  const until = pausedUntil ? dayjs(pausedUntil) : null;
  return until?.isValid() && until.isAfter(now) ? { kind: "general" } : null;
}
