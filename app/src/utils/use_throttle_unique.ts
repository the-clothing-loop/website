import { useState } from "react";
import useThrottledCallback from "beautiful-react-hooks/useThrottledCallback";
import { isFirstRun } from "vitest";

// ensures that the first call run by each key is overrides the throttle
export function useThrottleUnique(
  func: (key: string, ...a: any[]) => void,
  possibleKeys: string[],
  delay: number,
) {
  const [usedKeys, setUsedKeys] = useState<string[]>([]);
  const [firstRun, setFirstRun] = useState(true);
  const handleThrottledFuncArr = possibleKeys.map((k) =>
    useThrottledCallback(func, undefined, delay, {
      leading: true,
      trailing: false,
    }),
  );

  return (key: string, override = false, args: any[] = []) => {
    const keyIndex = possibleKeys.indexOf(key);
    if (keyIndex === -1) return;

    const isFirstKey = !usedKeys.includes(key);
    if (isFirstKey && !firstRun) override = true;
    if (isFirstKey) setUsedKeys((keys) => [key, ...keys]);
    if (firstRun) setFirstRun(false);

    if (override) func(key, ...args);
    else handleThrottledFuncArr[keyIndex](key, ...args);
  };
}
