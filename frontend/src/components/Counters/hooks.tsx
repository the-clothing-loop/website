import { useEffect } from "react";

const useIntersectionObserver = (
	callback: (el: any) => void,
	containerRef: { current: HTMLElement | null },
	options: { root: null; rootMargin: string; threshold: number }
) => {
	useEffect(() => {
		const observer = new IntersectionObserver(callback, options);
		if (containerRef.current) observer.observe(containerRef.current);

		return () => {
			if (containerRef.current) observer.unobserve(containerRef.current);
		};
	}, [containerRef, options]);
};

export default useIntersectionObserver;
