import { expect, test, vi } from "vitest";
import isPaused from "./is_paused";
import dayjs from "../dayjs";

test("should is pause be a date in the past then return true", () => {
  const now = dayjs().add(-1, "hour");

  expect(isPaused(now.format()) === true);
});

test("should is pause be a date in the future then return false", () => {
  const now = dayjs().add(1, "hour");

  expect(isPaused(now.format()) === false);
});

test("should is pause be null then return false", () => {
  expect(isPaused(null) === false);
});
