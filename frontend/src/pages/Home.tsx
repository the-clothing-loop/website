// Material
import { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import Button from "@material-ui/core/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Project resources
import { getChainsLength } from "../util/firebase/chain";
import { ClassNames } from "@emotion/react";
import { ClassSharp } from "@material-ui/icons";
import LandingPageMobile from "./LandingPageMobile";
import Counter from "../components/Counter";

//Media
import HeroImg from "../images/hero-image.png";
import SectionThreeImg from "../images/image_3.png";
import BagImage from "../images/bag_image.png";
import MapImage from "../images/map_image.png";
import ClothesImage from "../images/clothes_image.png";
import CirclesFrame from "../images/circles.png";
import SfmLogo from "../images/sfm_logo.png";
import CarouselImgOne from "../images/carousel_image_one.png";
import CarouselImgTwo from "../images/carousel_image_two.png";
import HorizontalArrow from "../images/horizontal_arrow.svg";
import Clothes from "../images/clothes.png";

const Home = () => {
  const [chainsCount, setChainsCount] = useState(0);

  const classes = makeStyles(theme as any)();

  useEffect(() => {
    (async () => {
      const chainsLengthResponse = await getChainsLength();
      setChainsCount(chainsLengthResponse);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Home</title>
        <meta name="description" content="Home" />
      </Helmet>

      <div style={{ backgroundColor: "#FFFFFF" }} id="landing-page-desktop">
        <div
          className={classes.landingPageWrapper}
          style={{
            position: "relative",
            margin: "5% 0",
          }}
        >
          <div
            style={{
              position: "absolute",
              height: "40%",
              backgroundColor: "#D5ECDF",
              width: "100vw",
            }}
          >
            <div
              style={{
                position: "relative",
                marginLeft: "40%",
                marginTop: "1%",
              }}
            >
              <img src={CirclesFrame} style={{ paddingRight: "8px" }} />
              <img src={CirclesFrame} />
            </div>
          </div>
          <div
            className={classes.landingPageHero}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              zIndex: "111111",
              position: "relative",
            }}
          >
            <div
              className={classes.heroTextWrapper}
              style={{ position: "relative", top: "10%", padding: " 0 80px" }}
            >
              <h1
                style={{
                  fontSize: "7rem",
                  lineHeight: "7rem",
                  fontWeight: "900",
                  color: "#518D7E",
                  margin: "2rem 0",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Swap it, <br />
                don't <br />
                <span
                  style={{
                    WebkitTextStroke: "1.5px #518d7e",
                    color: "transparent",
                  }}
                >
                  shop it
                </span>
              </h1>
              <p
                style={{
                  margin: " 2rem 0",
                  color: "#3C3C3B",
                  fontSize: "1.25rem",
                  lineHeight: "2rem",
                }}
              >
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam”
              </p>
              <Button
                className="btn btn-2"
                href="/loops/find"
                style={{
                  width: "282px",
                  height: "54.69px",
                  border: "1px solid #F7C86F",
                  fontSize: "1.25rem",
                  textTransform: "inherit",
                  borderRadius: "0px",
                  fontFamily: "Montserrat",
                }}
              >
                {"Find a loop"}
              </Button>
            </div>
            <div className={classes.heroImgWrapper} style={{ marginTop: "5%" }}>
              <div
                style={{
                  position: "relative",
                  height: " 80%",
                  overflow: "hidden",
                }}
              >
                <img
                  src={HeroImg}
                  alt="Kledingketting"
                  style={{
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    top: "-10%",
                  }}
                />
              </div>

              <div className={classes.circleBtn}>
                {
                  <ArrowDownwardIcon
                    style={{
                      width: "50%",
                      height: "auto",
                      color: "#518D7E",
                      position: "relative",
                      top: "50%",
                      left: "50%",
                      transform: " translate(-50%, -50%)",
                    }}
                  />
                }
              </div>
            </div>
          </div>
        </div>

        <div className={classes.stepsWrapper}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              margin: "5% 0",
            }}
          >
            <div
              style={{
                position: "relative",
                height: "90%",
                overflow: "hidden",
              }}
            >
              <img
                src={BagImage}
                style={{
                  width: "100%",
                  height: "auto",
                  position: "relative",
                  left: "80px",
                }}
              />
            </div>
            <div
              style={{
                textAlign: "left",
                paddingLeft: "2%",
                marginBottom: "2%",
              }}
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: " bold",
                  fontSize: "12.5rem",
                  WebkitTextStroke: "1.5px #518d7e",
                  color: "transparent",
                  margin: "0",
                  lineHeight: "96.3%",
                }}
              >
                1
              </h1>
              <h3
                style={{
                  color: "#518d7e",
                  fontSize: "80px",
                  margin: "0",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Find a <br />
                loop
              </h3>
              <p
                style={{
                  color: "#518d7e",
                  fontSize: "20px",
                  lineHeight: "40px",
                }}
              >
                To join a loop you need to <br />
                <a
                  href="/loops/find"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: "900",
                    fontSize: "24px",
                    lineHeight: "40px",
                    textDecoration: "underline",
                    color: "#518d7e",
                  }}
                >
                  find a loop near you
                </a>
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: " bold",
                  fontSize: " 258.76px",
                  WebkitTextStroke: "1.5px #48808B",
                  color: "transparent",
                  margin: "0",
                  lineHeight: "96.3%",
                }}
              >
                2
              </h1>
              <div style={{ padding: "0 2%", width: "40%" }}>
                <h3
                  style={{
                    color: "#48808B",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "80px",
                    lineHeight: "77.04px",
                    marginBottom: "2%",
                  }}
                >
                  Join
                </h3>
                <p
                  style={{
                    color: "#48808B",
                    textAlign: "left",
                    fontSize: "20px",
                    height: " 32px",
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  <a
                    href="/loops/find"
                    style={{ display: "block", margin: "2% 0" }}
                  >
                    <img src={HorizontalArrow} />
                  </a>
                </p>
              </div>
            </div>
            <div
              className={classes.imageAnimatedWrapper}
              style={{
                position: "relative",
                overflow: "hidden",
                height: "90%",
                width: "90%",
              }}
            >
              <img
                src={MapImage}
                style={{
                  width: "100%",
                  height: "auto",
                  position: "relative",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              position: "relative",
              marginTop: "10%",
            }}
          >
            <div
              style={{
                justifySelf: "center",
                position: "absolute",
                height: "549px",
                backgroundColor: "#F7C86F",
                width: "722px",
                opacity: " 0.3",
              }}
            ></div>
            <div
              style={{
                position: "relative",
                marginTop: "calc(549px / 2)",
                transform: "translateY(-50%)",
                display: "flex",
                justifyContent: "end",
              }}
            >
              <img src={SectionThreeImg} />
            </div>

            <div
              style={{ padding: "0 5%", position: "relative", bottom: "20%" }}
            >
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: " bold",
                  fontSize: " 258.76px",
                  WebkitTextStroke: "2px #C58C41",
                  color: "transparent",
                  margin: "0",
                  lineHeight: "96.3%",
                }}
              >
                3
              </h1>
              <div style={{ marginRight: "15%" }}>
                <h3
                  style={{
                    color: "#C58C41",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "80px",
                    lineHeight: "77.04px",
                    marginBottom: "10%",
                    marginTop: "5%",
                  }}
                >
                  Wait & Swap
                </h3>
                <p
                  style={{
                    color: "#C58C41",
                    textAlign: "left",
                    fontSize: "20px",
                    height: " 32px",
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua.usmod tempor incididunt ut labore et dolore magna
                  aliqua.usmod tempor incididunt ut labore et dolore magna
                  aliqua.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={'project-numbers-wrapper'}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
        >
          <div
            style={{
              backgroundColor: "#518D7E",
              display: "flex",
              flexDirection: "column",
              paddingLeft: "5%",
            }}
          >
            <h1
              style={{
                fontFamily: "Playfair Display",
                color: "white",
                fontSize: "96px",
              }}
            >
              What we do
            </h1>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              <Counter />

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
          </div>

          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ position: "relative", width: "50%" }}>
              <img src={Clothes} style={{ height: "100%", width: "auto" }} />
            </div>
            <div style={{ position: "relative", width: "50%" }}>
              <img src={Clothes} style={{ height: "100%", width: "100%" }} />
            </div>
            <div style={{ position: "relative", width: "50%" }}>
              <img src={Clothes} style={{ height: "100%", width: "100%" }} />
            </div>
            <div style={{ position: "relative", width: "50%" }}>
              <img src={Clothes} style={{ height: "100%", width: "100%" }} />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            margin: "5% 0",
          }}
        >
          <div>
            <img
              src={ClothesImage}
              alt=""
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              paddingRight: "15%",
              paddingLeft: "5%",
              position: "relative",
              bottom: "15%",
            }}
          >
            <h3
              style={{
                color: "#48808B",
                fontFamily: "Playfair Display",
                fontSize: "48px",
                lineHeight: "64px",
                fontWeight: "bold",
              }}
            >
              From local lockdown initiative to international success
            </h3>
            <p
              style={{
                color: "#48808B",
                fontSize: "20px",
                lineHeight: "32px",
                fontWeight: "normal",
              }}
            >
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laborisn”
            </p>

            <h5
              style={{
                color: "#48808B",
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: "900",
                textDecoration: "underline",
                fontFamily: "Playfair Display",
              }}
            >
              Read more about us
            </h5>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            margin: "5% 5%",
          }}
        >
          <div
            style={{
              position: "absolute",
              height: "252px",
              backgroundColor: "#D5ECDF",
              opacity: "0.3",
              width: "721px",
              left: "-5%",
              transform: "translateY(50%)",
            }}
          ></div>
          <h2
            style={{
              color: "#48808B",
              fontFamily: "Playfair Display",
              fontSize: "80px",
              lineHeight: "96.3%",
              fontWeight: "bold",
              zIndex: "1",
            }}
          >
            Supporters
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              zIndex: "1",
            }}
          >
            <div style={{ width: "150px", height: "150px" }}>
              <a>
                <img
                  src={SfmLogo}
                  alt="Slow Fashion Movement logo"
                  style={{ width: "100%", height: "auto" }}
                />
              </a>
            </div>

            <div style={{ width: "150px", height: "150px" }}>
              <a>
                <img
                  src={SfmLogo}
                  alt="Slow Fashion Movement logo"
                  style={{ width: "100%", height: "auto" }}
                />
              </a>
            </div>

            <div style={{ width: "150px", height: "150px" }}>
              <a>
                <img
                  src={SfmLogo}
                  alt="Slow Fashion Movement logo"
                  style={{ width: "100%", height: "auto" }}
                />
              </a>
            </div>

            <div style={{ width: "150px", height: "150px" }}>
              <a>
                <img
                  src={SfmLogo}
                  alt="Slow Fashion Movement logo"
                  style={{ width: "100%", height: "auto" }}
                />
              </a>
            </div>

            <div style={{ width: "150px", height: "150px" }}>
              <a>
                <img
                  src={SfmLogo}
                  alt="Slow Fashion Movement logo"
                  style={{ width: "100%", height: "auto" }}
                />
              </a>
            </div>
          </div>
        </div>

        <div
          style={{ position: "relative", height: "319px", overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "absolute",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <h1
              style={{
                color: "white",
                zIndex: "11",
              }}
            >
              THE CLOTHING LOOP
            </h1>
          </div>
        </div>
      </div>

      <LandingPageMobile />
    </>
  );
};

export default Home;
