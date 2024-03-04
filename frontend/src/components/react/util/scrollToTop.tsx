import { useEffect } from "react";

const ScrollToTop = (props: any) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
};

export default ScrollToTop;
