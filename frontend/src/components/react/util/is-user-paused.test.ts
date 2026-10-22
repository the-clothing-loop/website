import { afterEach, expect, test, vi } from "vitest";
import type { User } from "../../../api/types";
import isUserPaused from "./is-user-paused";

afterEach(() => vi.useRealTimers());

test("includes loop and current overall pauses, but excludes expired and other-loop pauses", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
  const user = (
    paused_until: string | null,
    chain_uid = "loop",
    is_paused = false,
  ) => ({ paused_until, chains: [{ chain_uid, is_paused }] }) as User;

  expect(isUserPaused(user(null, "loop", true), "loop")).toBe(true);
  expect(isUserPaused(user("2026-10-22T12:00:00Z"), "loop")).toBe(true);
  expect(isUserPaused(user("2026-10-21T12:00:00Z"), "loop")).toBe(false);
  expect(isUserPaused(user("2026-10-20T12:00:00Z"), "loop")).toBe(false);
  expect(isUserPaused(user(null, "other-loop", true), "loop")).toBe(false);
  expect(isUserPaused(user("invalid"), "loop")).toBe(false);
  expect(isUserPaused(user(null), "loop")).toBe(false);
});
