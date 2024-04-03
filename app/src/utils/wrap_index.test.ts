import { expect, test, vi } from "vitest";
import wrapIndex from "./wrap_index";

test("should wrap index correctly", () => {
  // prettier-ignore
  const tests = [
      {l: 3, i: 1, ex: 1},
      {l: [1,2,3], i: 1, ex: 1},
   ]
  for (const { l, i, ex } of tests) {
    expect(wrapIndex(i, l)).toBe(ex);
  }
});
