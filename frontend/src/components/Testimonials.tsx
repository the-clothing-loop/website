import { useState, useEffect, useRef, createRef } from "react";
import Carousel from "react-material-ui-carousel";

//MUI
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import theme from "../util/theme";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const Content = [
  {
    name: "bla bla",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    name: "bla bla",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    name: "bla bla",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },

  {
    name: "another",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    name: "another",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    name: "another",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
];

const Testimonials = () => {
  const classes = makeStyles(theme as any)();

  const refDiv = useRef<HTMLHeadingElement>(null);

  const [prev, setPrevious] = useState(false);
  const [next, setNext] = useState(false);

  let count = 0;
  let size = 1440;

  const nextClick = () => {
    if (count >= 1) return;

    if (refDiv.current !== null) {
      refDiv.current.style.transition = "transform 0.4s ease-in-out";
      setNext(true);
      setPrevious(false);
      count++;
      refDiv.current.style.transform = "translateX(" + -size * count + "px)";
    }
  };

  const prevClick = () => {

    if (count <= 0) return;
    if (refDiv.current !== null) {
      refDiv.current.style.transition = "transform 0.4s ease-in-out";
      setNext(false);
      setPrevious(true);
      count--;
      refDiv.current.style.transform = "translateX(" + -size * count + "px)";
    }


  };

  return (
    <div style={{ width: "100%" }}>
      <Typography
        component="h1"
        style={{
          fontFamily: "Playfair Display",
          fontWeight: "700",
          fontStyle: "normal",
          fontSize: "80px",
          lineHeight: "77.04px",
        }}
      >
        Testimonials
      </Typography>
      <div>
        <button onClick={prevClick}>previous</button>
        <button onClick={nextClick}>next</button>
      </div>

      <div
        ref={refDiv}
        style={{
          display: "flex",
          width: "max-content",
          position: "relative",
        }}
      >
        {Content.map((testimonial, i) => {
          return (
            <div
              key={i}
              style={{
                maxWidth: "450px",
                maxHeight: "400px",
                border: "1px solid pink",
                padding: "80px 45px",
                display: "grid",
                gap: "35px",
                position: "relative",
                margin: "0 20px",
              }}
            >
              <FormatQuoteIcon
                style={{
                  position: "absolute",
                  color: "pink",
                  transform: "rotate(-180deg)",
                  width: "100px",
                  height: "100px",
                  opacity: "0.5",
                  top: "0",
                  left: "0",
                }}
              />

              <Typography component="p">{testimonial.text}</Typography>
              <Typography
                component="p"
                style={{
                  fontFamily: "Playfair Display",
                  fontSize: "24px",
                  color: "pink",
                  textAlign: "right",
                  fontWeight: "900",
                }}
              >
                - {testimonial.name}
              </Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Testimonials;
