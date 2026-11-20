import { expect, test, vi, afterEach } from "vitest";
import type { User, UserChain } from "../../../api/types";
import { getPauseDetails } from "./pause-details";
import isUserPaused from "./is-user-paused";
import { getPausedDate } from "./pausedMembers";
afterEach(() => vi.useRealTimers());
test("example-loop list includes only loop pauses while general status has no dates", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-20T12:00:00Z"));
  const member = (
    until: string | null,
    paused = false,
    start: string | null = null,
  ) =>
    ({
      paused_until: until,
      chains: [{ chain_uid: "example", is_paused: paused, paused_at: start }],
    }) as User;
  for (const until of ["2025-07-11T20:27:00Z", "2026-11-09T14:49:00Z"]) {
    const u = member(until, false, "2025-01-01");
    expect(isUserPaused(u, "example")).toBe(false);
    expect(getPausedDate(u, "example")).toBe("");
  }
  const indefinite = member("2125-08-05T13:12:43Z");
  expect(isUserPaused(indefinite, "example")).toBe(false);
  expect(getPausedDate(indefinite, "example")).toBe("");
  expect(isUserPaused(member("2026-11-21T21:08:00Z"), "example")).toBe(false);
  expect(getPauseDetails(undefined, "2026-12-31T09:14:00Z")?.kind).toBe(
    "general",
  );
  expect(getPauseDetails(undefined, "2028-01-01T00:00:00Z")).toEqual({
    kind: "general",
  });
  expect(
    getPausedDate(member(null, true, "2026-09-28T11:23:17Z"), "example"),
  ).toBe("2026-09-28");
  expect(
    getPauseDetails({ is_paused: false, paused_at: "2026-09-28" } as UserChain),
  ).toBe(null);
});
