import { expect, test } from "vitest";
import { chainRadiusKm, distanceKm } from "./maps";

test("converts the legacy stored chain radius to host-facing kilometers", () => {
  expect(chainRadiusKm(40)).toBe(10);
});

test("calculates distance between coordinates in kilometers", () => {
  const distance = distanceKm([4.87743, 52.418198], {
    longitude: 4.89707,
    latitude: 52.377956,
  });

  expect(distance).toBeCloseTo(4.7, 1);
});
