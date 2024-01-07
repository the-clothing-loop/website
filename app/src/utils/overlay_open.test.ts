import { expect, test, vi } from "vitest";
import { OverlayContainsState, OverlayState } from "./overlay_open";

test("should binary be in value", () => {
  expect(
    OverlayContainsState(
      OverlayState.CLOSE_ALL,
      OverlayState.CLOSE_CHAIN_APP_DISABLED,
    ),
  );

  expect(
    OverlayContainsState(OverlayState.CLOSE_ALL, OverlayState.CLOSE_PAUSED),
  );

  expect(OverlayContainsState(OverlayState.CLOSE_ALL, OverlayState.CLOSE_ALL));

  expect(OverlayContainsState(OverlayState.OPEN_ALL, OverlayState.OPEN_ALL));
});

test("should binary not be in value", () => {
  expect(
    !OverlayContainsState(
      OverlayState.OPEN_ALL,
      OverlayState.CLOSE_CHAIN_APP_DISABLED,
    ),
  );

  expect(
    !OverlayContainsState(OverlayState.OPEN_ALL, OverlayState.CLOSE_PAUSED),
  );

  expect(!OverlayContainsState(OverlayState.OPEN_ALL, OverlayState.CLOSE_ALL));
});
