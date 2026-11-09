import { describe, expect, it } from "vitest";
import type { User } from "../../../api/types";
import { getPausedDate, sortPausedMembers } from "./pausedMembers";

const member = (
  name: string,
  paused_at: string | null,
  created_at = "2026-01-01",
) =>
  ({
    name,
    email: `${name}@example.com`,
    chains: [
      { chain_uid: "other", is_paused: true, paused_at: "2026-11-09" },
      { chain_uid: "loop", is_paused: true, paused_at, created_at },
    ],
  }) as User;

describe("paused members", () => {
  it("sorts the current loop's pauses newest first, with unknown dates last", () => {
    const users = [
      member("Old", "2026-09-01"),
      member("Unknown", null),
      member("New", "2026-11-01"),
      member("Invalid", "invalid"),
    ];
    expect(
      sortPausedMembers(users, "loop", "paused").map((u) => u.name),
    ).toEqual(["New", "Old", "Unknown", "Invalid"]);
    expect(users[0].name).toBe("Old");
  });
  it("retains signup-date and alphabetical sorting", () => {
    const users = [
      member("Z", "2026-11-01", "2026-01-01"),
      member("A", "2026-09-01", "2026-02-01"),
    ];
    for (const sort of ["name", "email", "date"] as const) {
      expect(sortPausedMembers(users, "loop", sort)[0].name).toBe("A");
    }
  });
  it("exports an unambiguous date only for an active pause in the selected loop", () => {
    const user = member("A", "2026-09-12T15:30:00Z");
    expect(getPausedDate(user, "loop")).toBe("2026-09-12");
    expect(getPausedDate(user, "missing")).toBe("");
    user.chains[1].is_paused = false;
    expect(getPausedDate(user, "loop")).toBe("");
    expect(getPausedDate(member("A", "invalid"), "loop")).toBe("");
  });
});
