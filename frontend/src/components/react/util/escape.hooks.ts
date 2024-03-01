import { useEffect } from "react";

export function useEscape(func: (e: KeyboardEvent) => void) {
  useEffect(() => {
    let listener = (e: KeyboardEvent) => {
      if (e.code !== "Escape") return;
      func(e);
    };
    document.addEventListener("keyup", listener);
    return () => document.removeEventListener("keyup", listener);
  }, []);
}
