import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

//MUI
import { Typography, Grid, Paper, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const useStyles = makeStyles({
  componentWrapperRoot: {
    width: "100%",
    maxWidth: "1440px",
    position: "relative",
    paddingBottom: "100px",
    left: "50%",
    transform: "translateX(-50%)",

    "& .btn-nav-wrapper": {
      display: "flex",
      justifyContent: "flex-end",
      padding: "20px 0",
      marginRight: "30px",
    },
  },
  headingTypographyRoot: {
    fontFamily: "Playfair Display",
    fontWeight: "bold",
    fontStyle: "normal",
    fontSize: "80px",
    lineHeight: "77.04px",
    color: "#48808B",
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
    height: "420px",
    backgroundColor: "rgb(72, 128, 139, 0.1)",
    padding: "50px 45px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    margin: "0 30px",
    borderRadius: "0px",

    "& .format-quote-icon": {
      position: "absolute",
      color: "#48808B",
      transform: "rotate(-180deg)",
      width: "120px",
      height: "120px",
      opacity: "0.4",
      top: "0",
      left: "0",
    },
  },

  contentTypographyRoot: {
    fontStyle: "normal",
    fontSize: "18px",
    lineHeight: "1.5",
    color: "#48808B",
    margin: "10px 0",
  },

  testimonialAuthor: {
    fontFamily: "Playfair Display",
    fontSize: "24px",
    color: "#48808B",
    textAlign: "right",
    fontWeight: "bold",
    margin: "10px 0",
  },

  carouselButtonActive: {
    width: "60px",
    height: "60px",
    backgroundColor: "#48808B",
    borderRadius: "50%",
    padding: "0",
    margin: "10px",

    "&:hover": {
      backgroundColor: "rgb(72, 128, 139, 0.1)",
      border: "1px solid #48808B",

      "& .css-i4bv87-MuiSvgIcon-root": {
        color: "#48808B !important",
      },
    },

    "& .arrow-icon": {
      color: "white",
      width: "30px",
      height: "30px",
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
      backgroundColor: "#48808B",
    },

    "& .arrow-icon": {
      color: "white",
      width: "30px",
      height: "30px",
    },
  },
});

const Content = [
  {
    author: "Roos",
    content:
      "I think it's great to be able to 'shop' regularly without burdening your wallet or the environment",
  },
  {
    author: "Unknown",
    content:
      "Teach them young! My daughters, aged 13 and 16, regularly find something cool in the bag. I love how this teaches them that clothes can perfectly well be sourced second-hand. Sustainability and environmental awareness should be an important part of any upbringing, in my opinion!",
  },
  {
    author: "Participant in Barendrecht",
    content:
      "Someone in my loop landed a new job. Guess who's dress she wore to her interview?",
  },
  {
    author: "Nienke",
    content:
      "The best part is trying on things you would never try in the store, and then realise you really like them",
  },

  {
    author: "Lia",
    content:
      "A nice bonus is: you get to know people in your neighbourhood, usually neighbours who already have a somewhat green heart. This makes it a small step – if you really need something but would rather not buy it – to ask if someone in the Loop can perhaps lend it to you, like ski pants or a costume for a theme party!",
  },
  {
    author: "Ella",
    content:
      "After the third bag I receive it dawns on me: what an incredible amount of clothes we all have in the closet!",
  },
];

const Testimonials = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const refDiv = useRef<HTMLHeadingElement>(null);

  const [count, setCount] = useState(0);

  const nextClick = () => {
    if (count >= 1) return;

    if (refDiv.current !== null) {
      refDiv.current.style.transition = "transform 0.4s ease-in-out";
      setCount(count + 1);
      refDiv.current.style.transform = "translateX(-1440px)";
    }
  };

  const prevClick = () => {
    if (count <= 0) return;

    if (refDiv.current !== null) {
      refDiv.current.style.transition = "transform 0.4s ease-in-out";
      setCount(count - 1);
      refDiv.current.style.transform = "translateX(0px)";
    }
  };

  return (
    <Grid classes={{ root: classes.componentWrapperRoot }}>
      <section>
        <Typography
          classes={{ root: classes.headingTypographyRoot }}
          component="h1"
        >
          {t("testimonials")}
        </Typography>
        <div className="btn-nav-wrapper">
          <Button
            classes={{
              root:
                count === 1
                  ? classes.carouselButtonActive
                  : classes.carouselButtonInactive,
            }}
            onClick={prevClick}
          >
            <ArrowBackIcon className="arrow-icon" />
          </Button>
          <Button
            classes={{
              root:
                count === 0
                  ? classes.carouselButtonActive
                  : classes.carouselButtonInactive,
            }}
            onClick={nextClick}
          >
            <ArrowForwardIcon className="arrow-icon" />
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
                  <FormatQuoteIcon className="format-quote-icon" />

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
      </section>
    </Grid>
  );
};

export default Testimonials;
