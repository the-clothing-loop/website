import { expect, test } from "vitest";
import wrapIndex from "./wrap_index";

test("should wrap index correctly", () => {
  // prettier-ignore
  const tests = [
    {l: 1, i: 0, ex: 0},
    {l: 1, i: 1, ex: 0},
    {l: 1, i: 2, ex: 0},
    {l: 3, i: 3, ex: 0},
    {l: 3, i: 0, ex: 0},
    {l: 3, i: 6, ex: 0},
    {l: 3, i: 1, ex: 1},
    {l: 3, i: 4, ex: 1},
    {l: 3, i: -1, ex: 2},
   ]
  for (const { l, i, ex } of tests) {
    expect(wrapIndex(i, l)).equal(ex);
  }
});
