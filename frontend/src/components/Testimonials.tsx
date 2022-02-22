import { useRef, useState } from "react";

//MUI
import { Typography, Grid, Paper, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import theme from "../util/theme";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const useStyles = makeStyles({
  headingTypographyRoot: {
    fontFamily: "Playfair Display",
    fontWeight: "bold",
    fontStyle: "normal",
    fontSize: "80px",
    lineHeight: "77.04px",
    color: "#C58C41",
    marginLeft: "30px",
  },
  carouselContainer: {
    position: "relative",
    overflow: "hidden",
    transform: "translateX(-50%)",
    left: "50%",
    maxWidth: "1440px",
    zIndex: 1,
  },

  carouselContentContainer: {
    display: "flex",
    minWidth: "2880px",
    position: "relative",
    justifyContent: "space-evenly",
  },

  carouselElement: {
    width: "400px",
    height: "450px",
    border: "1px solid #C58C41",
    padding: "50px 45px",
    display: "grid",
    gap: "20px",
    position: "relative",
    margin: "0 30px",
    borderRadius: "0px",
    backgroundColor: "white",
  },

  contentTypographyRoot: {
    fontStyle: "normal",
    fontSize: "18px",
    lineHeight: "32px",
    color: "#C58C41",
  },

  testimonialAuthor: {
    fontFamily: "Playfair Display",
    fontSize: "24px",
    color: "#C58C41",
    textAlign: "right",
    fontWeight: "bold",
  },

  carouselButtonActive: {
    width: "60px",
    height: "60px",
    backgroundColor: "#48808B",
    borderRadius: "50%",
    padding: "0",
    margin: "10px",

    "&:hover": {
      backgroundColor: "white",
      border: "1px solid #48808B",

      "& .css-i4bv87-MuiSvgIcon-root": {
        color: "#48808B !important",
      },
    },
  },

  carouselButtonInactive: {
    width: "60px",
    height: "60px",
    backgroundColor: "#48808B",
    borderRadius: "50%",
    padding: "0",
    margin: "10px",
    opacity: "0.4",

    "&:hover": {
      backgroundColor: "white",
      border: "1px solid #48808B",

      "& .css-i4bv87-MuiSvgIcon-root": {
        color: "#48808B !important",
      },
    },
  },
  backgroundElementRoot: {
    position: "absolute",
    background: "#F7C86F",
    width: "90%",
    bottom: "0",
    opacity: "0.3",
    height: "400px",
    zIndex: 0,
  },
});

const Content = [
  {
    author: "author name",
    content:
      "I think it's great to be able to 'shop' regularly without burdening your wallet or the environment",
  },
  {
    author: "author name",
    content:
      "Someone in my loop landed a new job. Guess who's dress she wore to her interview?",
  },
  {
    author: "author name",
    content:
      "The best part is trying on things you would never try in the store, and then realise you really like them",
  },

  {
    author: "author name",
    content:
      "Teach them young! My daughters, aged 13 and 16, regularly find something cool in the bag. I love how this teaches them that clothes can perfectly well be sourced second-hand. Sustainability and environmental awareness should be an important part of any upbringing, in my opinion!",
  },
  {
    author: "author name",
    content:
      "A nice bonus is: you get to know people in your neighbourhood, usually neighbours who already have a somewhat green heart. This makes it a small step – if you really need something but would rather not buy it – to ask if someone in the Loop can perhaps lend it to you, like ski pants or a costume for a theme party!",
  },
  {
    author: "author name",
    content:
      "After the third bag I receive it dawns on me: what an incredible amount of clothes we all have in the closet!",
  },
];

const Testimonials = () => {
  const classes = useStyles();

  const refDiv = useRef<HTMLHeadingElement>(null);

  const [next, setNext] = useState(true);
  const [previous, setPrevious] = useState(false);

  let count = 0;
  let size = 1440;
  console.log(count);
  const nextClick = () => {
    console.log(count);
    if (count >= 1) return;

    if (refDiv.current !== null) {
      refDiv.current.style.transition = "transform 0.4s ease-in-out";

      count++;
      refDiv.current.style.transform = "translateX(" + -size * count + "px)";

      // setNext(false);
    }
  };

  const prevClick = () => {
    console.log(count);
    if (count <= 0) return;
    if (refDiv.current !== null) {
      refDiv.current.style.transition = "transform 0.4s ease-in-out";

      count--;
      refDiv.current.style.transform = "translateX(" + -size * count + "px)";

      // setNext(true);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1440px",
        position: "relative",
        padding: "10% 0",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <div>
        <Typography
          classes={{ root: classes.headingTypographyRoot }}
          component="h1"
        >
          Testimonials
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "20px 0",
            marginRight:'30px'
          }}
        >
          <Button
            classes={{
              root: previous
                ? classes.carouselButtonActive
                : classes.carouselButtonInactive,
            }}
            onClick={prevClick}
          >
            <ArrowBackIcon
              style={{ color: "white", width: "30px", height: "30px" }}
            />
          </Button>
          <Button
            classes={{
              root: next
                ? classes.carouselButtonActive
                : classes.carouselButtonInactive,
            }}
            onClick={nextClick}
          >
            <ArrowForwardIcon
              style={{ color: "white", width: "30px", height: "30px" }}
            />
          </Button>
        </div>

        <Grid container classes={{ root: classes.carouselContainer }}>
          <Grid
            classes={{ root: classes.carouselContentContainer }}
            ref={refDiv}
          >
            {Content.map((testimonial, i) => {
              return (
                <Paper classes={{ root: classes.carouselElement }} key={i}>
                  <FormatQuoteIcon
                    style={{
                      position: "absolute",
                      color: "#C58C41",
                      transform: "rotate(-180deg)",
                      width: "120px",
                      height: "120px",
                      opacity: "0.4",
                      top: "0",
                      left: "0",
                    }}
                  />

                  <Typography
                    component="p"
                    classes={{ root: classes.contentTypographyRoot }}
                  >
                    {testimonial.content}
                  </Typography>
                  <Typography
                    classes={{ root: classes.testimonialAuthor }}
                    component="p"
                  >
                    - {testimonial.author}
                  </Typography>
                </Paper>
              );
            })}
          </Grid>
        </Grid>
      </div>
      <Grid classes={{ root: classes.backgroundElementRoot }}></Grid>
    </div>
  );
};

export default Testimonials;
