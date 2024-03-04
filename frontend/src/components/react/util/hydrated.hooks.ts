import { useEffect, useMemo, useState } from "react";
import isSSR from "./is_ssr";

export default function useHydrated<T = boolean>(
  init: () => T = () => true as T,
): T | undefined {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (isSSR()) return;
    setHydrated(true);
  }, []);

  return useMemo(() => (hydrated ? init() : undefined), [hydrated]);
}
