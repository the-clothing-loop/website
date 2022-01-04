import * as React from "react";
import { useEffect, useState, useRef } from "react";

//project resources
import { getChainsLength } from "../util/firebase/chain";

//mui
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

const Counter = () => {
  const [chains, setChains] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [active, setActive] = useState(false);
  const [chainsState, setChainsState] = useState({ count: 0 });
  const [participantsState, setParticipantsState] = useState({ count: 0 });

  const [state, setState] = useState({ count: 0 });

  const classes = makeStyles(theme as any)();

  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const chainsLengthResponse = await getChainsLength();
      setChains(chainsLengthResponse);
      setParticipants(25);
    })();
  }, []);

  let counter = (minimum: number, maximum: number) => {
    for (let count = minimum; count <= maximum; count++) {
      setTimeout(() => {
        setState({ count });
      }, 200);
    }
  };



  const callBAck = (entries: any) => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  const options = {
    root: null,
    rootMargin: "50px",
    threshold: 0.5,
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callBAck, options);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef, options]);

  return (
    <div ref={containerRef}>
      <div style={{ position: "relative", width: "50%" }} className="isVisible">
        {isVisible && active ? counter(0, 200) : console.log("not visible")}
        <h1
          style={{
            fontFamily: "Playfair Display",
            color: "transparent",
            WebkitTextStroke: "1px white",
            fontSize: "78px",
            margin: "1% 0",
          }}
        >
          {state.count}
        </h1>
        <h3
          style={{
            fontFamily: "Playfair Display",
            color: "white",
            fontSize: "49px",
            margin: "1% 0",
          }}
        >
          {"people"}
        </h3>
      </div>
      <div style={{ position: "relative", width: "50%" }} className="isVisible">
        {isVisible  ? counter(0, 200) : console.log("not visible")}

        <h1
          style={{
            fontFamily: "Playfair Display",
            color: "transparent",
            WebkitTextStroke: "1px white",
            fontSize: "78px",
            margin: "1% 0",
          }}
        >
          {participantsState.count}
        </h1>
        <h3
          style={{
            fontFamily: "Playfair Display",
            color: "white",
            fontSize: "49px",
            margin: "1% 0",
          }}
        >
          {"countries"}
        </h3>
      </div>
      <div style={{ position: "relative", width: "50%" }} className="isVisible">
        {isVisible ? counter(0, 200) : console.log("not visible")}

        <h1
          style={{
            fontFamily: "Playfair Display",
            color: "transparent",
            WebkitTextStroke: "1px white",
            fontSize: "78px",
            margin: "1% 0",
          }}
        >
          {"cities"}
        </h1>
        <h3
          style={{
            fontFamily: "Playfair Display",
            color: "white",
            fontSize: "49px",
            margin: "1% 0",
          }}
        >
          {"loops"}
        </h3>
      </div>
    </div>
  );
};

export default Counter;
