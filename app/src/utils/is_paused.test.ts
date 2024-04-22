import { expect, test } from "vitest";
import IsPaused from "./is_paused";
import dayjs from "../dayjs";

function TestIsPausedByDate(date: string | null) {
  return IsPaused({ chains: [], paused_until: date } as any, "");
}

test("should is pause be a date in the past then return true", () => {
  const now = dayjs().add(-1, "hour");

  expect(TestIsPausedByDate(now.format()) === true);
});

test("should is pause be a date in the future then return false", () => {
  const now = dayjs().add(1, "hour");

  expect(TestIsPausedByDate(now.format()) === false);
});

test("should is pause be null then return false", () => {
  expect(TestIsPausedByDate(null) === false);
});

test("should be paused when the current user chain is paused", () => {
  expect(
    IsPaused(
      { chains: [{ chain_uid: "test", is_paused: true }] } as any,
      "test",
    ),
  );
});
