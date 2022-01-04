import * as React from "react";
import { useEffect, useState, useRef } from "react";

//project resources
import { getChainsLength } from "../util/firebase/chain";
import SingleCounter from "./SingleCounter";

//mui
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import { number } from "yup/lib/locale";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const Counters = () => {
  const classes = makeStyles(theme as any)();
  const containerRef = useRef(null);

  const [chains, setChains] = useState(0);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const chainsLengthResponse = await getChainsLength();
      setChains(chainsLengthResponse);
    })();
  }, []);

  //check if div is visible on viewport
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
    <div ref={containerRef} style={{ display: "flex", flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: "50%" }} className="isVisible">
        <h1
          style={{
            fontFamily: "Playfair Display",
            color: "transparent",
            WebkitTextStroke: "1px white",
            fontSize: "78px",
            margin: "1% 0",
          }}
        >
          {isVisible ? <SingleCounter end={350} step={2} /> : "0"}
        </h1>
        <h3
          style={{
            fontFamily: "Playfair Display",
            color: "white",
            fontSize: "49px",
            margin: "1% 0",
          }}
        >
          {"Different loops"}
        </h3>
      </div>
      <div style={{ position: "relative", width: "50%" }} className="isVisible">
        <h1
          style={{
            fontFamily: "Playfair Display",
            color: "transparent",
            WebkitTextStroke: "1px white",
            fontSize: "78px",
            margin: "1% 0",
          }}
        >
          {isVisible ? <SingleCounter end={13000} step={15} /> : "0"}
        </h1>
        <h3
          style={{
            fontFamily: "Playfair Display",
            color: "white",
            fontSize: "49px",
            margin: "1% 0",
          }}
        >
          {"People"}
        </h3>
      </div>
      <a style={{ position: "relative", width: "50%" }} href="/loops/find">
        <div className="isVisible">
          <h1
            style={{
              fontFamily: "Playfair Display",
              color: "transparent",
              WebkitTextStroke: "1px white",
              fontSize: "78px",
              margin: "1% 0",
            }}
          >
            {"5"}
          </h1>
          <h3
            style={{
              fontFamily: "Playfair Display",
              color: "white",
              fontSize: "49px",
              margin: "1% 0",
            }}
          >
            {"Countries"}
          </h3>
        </div>
      </a>
      <div style={{ position: "relative", width: "50%" }}>
        <div style={{ height: "105px" }}>
          <a
            href="/loops/find"
            style={{
              backgroundColor: "#F7C86F",
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              display: "inline-block",
              top: "50%",
              position: "relative",
              transform: "translateY(-50%)",
            }}
          >
            <ArrowDownwardIcon
              style={{
                position: "relative",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-90deg) ",
                color: "white",
              }}
            />
          </a>
        </div>
        <h3
          style={{
            fontFamily: "Playfair Display",
            color: "white",
            fontSize: "49px",
            margin: "1% 0",
          }}
        >
          Our goals
        </h3>
      </div>
    </div>
  );
};

export default Counters;
