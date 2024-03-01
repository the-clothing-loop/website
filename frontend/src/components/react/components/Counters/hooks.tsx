import { useEffect, useState } from "react";

export default function useIntersectionObserver(
  containerRef: { current: HTMLElement | null },
  options: IntersectionObserverInit,
  initialIsIntersecting: boolean = false
) {
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);

  function callback(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef, options]);

  return isIntersecting;
}
