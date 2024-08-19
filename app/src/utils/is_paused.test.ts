import { describe, expect, it } from "vitest";
import IsPaused, { IsPausedHow } from "./is_paused";
import dayjs from "../dayjs";
import { el } from "@faker-js/faker";

function TestIsPausedByDate(date: string | null) {
  return IsPaused({ chains: [], paused_until: date } as any, "");
}

describe("IsPaused", () => {
  it("should is pause be a date in the past then return true", () => {
    const now = dayjs().add(-1, "hour");

    expect(TestIsPausedByDate(now.format()) === true);
  });

  it("should is pause be a date in the future then return false", () => {
    const now = dayjs().add(1, "hour");

    expect(TestIsPausedByDate(now.format()) === false);
  });

  it("should is pause be null then return false", () => {
    expect(TestIsPausedByDate(null) === false);
  });

  it("should be paused when the current user chain is paused", () => {
    expect(
      IsPaused(
        {
          chains: [{ chain_uid: "test", is_paused: true }],
          paused_until: dayjs().add(-1, "hour"),
        } as any,
        "test",
      ),
    );
  });
});

describe("IsPausedHow", () => {
  function t(
    chainIsPaused: boolean,
    userIsPaused: boolean | string,
    expectChain: boolean,
    expectUser: boolean | string,
  ) {
    const res = IsPausedHow(
      {
        chains: [{ chain_uid: "test", is_paused: chainIsPaused }],
        paused_until: userIsPaused,
      } as any,
      "test",
    );

    expect(res.chain).toBe(expectChain);
    if (!res.user) {
      expect(res.user).toBeFalsy();
    } else {
      expect(res.user.toISOString()).toBe(expectUser);
    }
  }
  it("should be chain paused; user unpaused", () => {
    t(true, false, true, false);
  });

  it("should be chain unpaused; user paused", () => {
    const pausedDate = dayjs("2100-01-01");
    t(false, pausedDate.toISOString(), false, pausedDate.toISOString());
  });

  it("should be chain unpaused; user old paused", () => {
    const pausedDate = dayjs("2000-01-01");
    t(false, pausedDate.toISOString(), false, false);
  });
});
