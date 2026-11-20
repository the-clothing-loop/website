import type { UserChain } from "../../../api/types";
import dayjs from "./dayjs";

export function getPauseDetails(
  chain: UserChain | undefined,
  pausedUntil?: string | null,
): { kind: "since" | "until" | "unknown"; date?: string } | null {
  const now = dayjs();
  const until = pausedUntil ? dayjs(pausedUntil) : null;
  const overallPause = !!until?.isValid() && until.isAfter(now);
  if (!chain?.is_paused && !overallPause) return null;

  const since =
    chain?.is_paused && chain.paused_at ? dayjs(chain.paused_at) : null;
  if (since?.isValid() && !since.isAfter(now)) {
    return { kind: "since", date: chain!.paused_at! };
  }
  // The existing app encodes "until I turn it back on" as start + 100 years.
  if (overallPause && until!.isAfter(now.add(20, "years"))) {
    const start = until!.subtract(100, "years");
    if (!start.isAfter(now))
      return { kind: "since", date: start.toISOString() };
  }
  if (overallPause && !until!.isAfter(now.add(1, "year"))) {
    return { kind: "until", date: pausedUntil! };
  }
  return { kind: "unknown" };
}
