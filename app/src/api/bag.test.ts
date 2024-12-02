import { describe, test, expect } from "vitest";
import { Bag } from "./typex2";
import { faker } from "@faker-js/faker";
import { sortBags } from "./bag";

describe("should sort correctly", () => {
  const newBag = (n: string) => ({ number: n }) as any as Bag;

  // for (let i = 0; i < 30; i++) {
  const suts = [
    "1,2,3,4",
    "1,2,3b,4,action,bag,bag1,bag10,bag2,z",
    "1,1,2,3,12,14,15,Bag 10,Bag 11,Bag 12,Bag 13,Bag 5,Bag 6,Bag 7,Bag 8,Bag 9,Great Divide Yeti,North Coast Old Rasputin",
    "action,bag,bag1,bag10,bag2,z",
    "1,2,3,4",
    "bag1,bag10,bag2",
    "1,4,10,bag1,bag10,bag2",
  ];

  suts.forEach((sut, i) => {
    test("sut index " + i, () => {
      let bags = sut
        .split(",")
        .toSorted(() => faker.number.int({ min: -1, max: 1 }))
        .map((s) => newBag(s));
      bags = sortBags(bags);
      const val = bags.map((b) => b.number).join(",");

      expect(val).toEqual(sut);
    });
  });
  // }
});

test("test regx", () => {
  const regxBag = /^(\d+)/;
  const suts = "1,2,3b,4,action,bag,bag1,bag10,bag2,z";
  const expected = [1, 2, 3, 4, NaN, NaN, NaN, NaN, NaN, NaN];

  suts.split(",").forEach((sut, i) => {
    const match = regxBag.exec(sut);
    const no = match?.[1] ? parseInt(match[1]) : NaN;
    expect(no).toEqual(expected[i]);
  });
});
