import { useState, useRef, useContext } from "react";

//project resources
import { ChainsContext } from "../ChainsProvider";
import SingleCounter from "./SingleCounter";
import useIntersectionObserver from "./hooks";

import theme from "../../util/theme";
import { ArrowDownward as ArrowDownwardIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

const Counters = () => {
  const classes = makeStyles(theme as any)();
  const containerRef = useRef(null);

  const chainsCount = useContext(ChainsContext).length;

  const [isVisible, setIsVisible] = useState(false);

  //check if div is visible on viewport
  const callBack = (entries: any) => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  const options = {
    root: null,
    rootMargin: "50px",
    threshold: 0.5,
  };

  useIntersectionObserver(callBack, containerRef, options);

  return (
    <div ref={containerRef} className={classes.countersWrapper}>
      <div className="isVisible">
        <h1>{isVisible ? <SingleCounter end={415} step={2} /> : "0"}</h1>
        <h3>{"Loops"}</h3>
      </div>
      <div className="isVisible">
        <h1>{isVisible ? <SingleCounter end={15000} step={20} /> : "0"}</h1>
        <h3>{"participants"}</h3>
      </div>
      <a className="isVisible" href="/loops/find">
        <h1>{"3"}</h1>
        <h3>{"Countries"}</h3>
      </a>
      <div className={classes.counterLinkWrapper}>
        <div className={classes.counterLinkIconWrapper}>
          <a
            href="https://heyzine.com/flip-book/a2735d7012.html"
            target="_blank"
            className={classes.counterLink}
          >
            <ArrowDownwardIcon className="icon" />
          </a>
        </div>
        <h3>Our goals</h3>
      </div>
    </div>
  );
};

export default Counters;
