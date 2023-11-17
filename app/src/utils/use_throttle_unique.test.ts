import { expect, test, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThrottleUnique } from "./use_throttle_unique";

test("adds 1 + 2 to equal 3", () => {
  vi.useFakeTimers();

  const keys = ["a", "b", "c", "d"];
  let counter = 0;
  const { result } = renderHook(() =>
    useThrottleUnique(
      (k) => {
        ++counter;
      },
      keys,
      500, // 500 milliseconds throttle
    ),
  );
  act(() => {
    result.current("a");
    expect(counter).toEqual(1);
    result.current("b");
    expect(counter).toEqual(2);
    vi.advanceTimersByTime(300); // 300 ms elapsed total
    result.current("b");
    expect(counter).toEqual(2);
    vi.advanceTimersByTime(300); // 600 ms elapsed total
    result.current("b");
    expect(counter).toEqual(3);
  });

  vi.clearAllTimers();
});
