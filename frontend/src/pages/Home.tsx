// Material
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { makeStyles, Button, Grid } from "@material-ui/core";

import theme from "../util/theme";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Newsletter } from "../components/Newsletter/Newsletter";

// Project resources
import { getChainsLength } from "../util/firebase/chain";
import { ClassNames } from "@emotion/react";
import { ClassSharp } from "@material-ui/icons";
import LandingPageMobile from "./LandingPageMobile";
import Counters from "../components/Counters";
import Carousel from "../components/Carousel";

//Media
import HeroImg from "../images/hero-image.png";
import SectionThreeImg from "../images/image_3.png";
import BagImage from "../images/Utrecht.jpeg";
import MapImage from "../images/map_image.png";
import ClothesImage from "../images/Nichon_zelfportret.jpg";
import CirclesFrame from "../images/circles.png";
import HorizontalArrow from "../images/horizontal_arrow.svg";
import Clothes from "../images/clothes.png";
//Logos
import SfmLogo from "../images/logos/sfm_logo.png";
import CollActionLogo from "../images/logos/Logo-CollAction.png";
import ImpactHubLogo from "../images/logos/LOGO-IMPACTHUB.png";
import EssenseLogo from "../images/logos/essense-logo.svg";
import WdcdLogo from "../images/logos/Logo_WDCD.png";

const Home = () => {
  const [chainsCount, setChainsCount] = useState(0);

  const classes = makeStyles(theme as any)();

  const supporters = [
    {
      logo: SfmLogo,
      url: "https://slowfashion.global/",
    },
    {
      logo: EssenseLogo,
      url: "https://essense.eu/",
    },
    {
      logo: CollActionLogo,
      url: "https://www.collaction.org/",
    },
    {
      logo: ImpactHubLogo,
      url: "https://impacthub.net/",
    },

    { logo: WdcdLogo, url: "https://www.whatdesigncando.com/" },
  ];

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

      <div id="landing-page-desktop" className={classes.landingPageDesktop}>
        <div className={classes.landingPageWrapper}>
          <div className="background-box">
            <div className="circles-frame">
              <img src={CirclesFrame} alt="circles-frame" />
              <img src={CirclesFrame} alt="circles-frame" />
            </div>
          </div>
          <div className="landing-page-hero">
            <div className="hero-text-wrapper">
              <h1>
                Swap it, <br />
                don't <br />
                <span>shop it</span>
              </h1>
              <p>
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam”
              </p>
              <Button className="btn btn-2" href="/loops/find">
                {"Find a loop"}
              </Button>
            </div>
            <div className="hero-image-wrapper">
              <div className="image-wrapper">
                <img src={HeroImg} alt="Kledingketting" />
              </div>

              <div className={classes.circleBtn}>
                {<ArrowDownwardIcon className="icon" />}
              </div>
            </div>
          </div>
        </div>

        <div className={classes.sectionsWrapper}>
          <div className="single-section-wrapper">
            <div className="image-wrapper">
              <img src={BagImage} alt="clothing bag" />
            </div>
            <img className="circles-frame" src={CirclesFrame} />

            <div className="text-wrapper">
              <h1>1</h1>
              <h3>
                Find a <br />
                loop
              </h3>
              <p>
                To join a loop you need to <br />
                <a href="/loops/find">find a loop near you</a>
              </p>
            </div>
          </div>
          <div className="single-section-wrapper-2">
            <div className="text-wrapper">
              <h1>2</h1>
              <div>
                <h3>Join</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  <a href="/loops/find">
                    <img src={HorizontalArrow} />
                  </a>
                </p>
              </div>
            </div>
            <div className={classes.imageAnimatedWrapper}>
              <img src={MapImage} alt="map image" />
            </div>
            <img className="circles-frame" src={CirclesFrame} />
          </div>
          <div className="single-section-wrapper-3">
            <img
              className="circles-frame"
              src={CirclesFrame}
              alt="circles frame"
            />
            <div className="background-box"></div>

            <div className="image-wrapper">
              <img src={SectionThreeImg} />
            </div>

            <div className="text-wrapper">
              <h1>3</h1>
              <div>
                <h3>Wait & Swap</h3>
                <p>
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

        <div className={classes.projectNumbersWrapper}>
          <div className="inner-wrapper">
            <h1>What we do</h1>
            <Counters />
          </div>

          <div className="images-wrapper">
            <div>
              <img src={Clothes} alt="bags of clothes" />
            </div>
            <div>
              <img src={Clothes} alt="bags of clothes" />
            </div>
            <div>
              <img src={Clothes} alt="bags of clothes" />
            </div>
            <div>
              <img src={Clothes} alt="bags of clothes" />
            </div>
          </div>
        </div>

        <div className={classes.aboutSectionWrapper}>
          <div className="image-wrapper">
            <img src={ClothesImage} alt="" />
          </div>
          <div className="text-wrapper">
            <h3>From local lockdown initiative to international success</h3>
            <p>
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laborisn”
            </p>

            <h5>Read more about us</h5>
          </div>
        </div>

        <div className={classes.supportersSection}>
          <div className="background-box"></div>
          <h2>Partners & Sponsors</h2>
          <div className="logos-wrapper">
            {supporters.map((el, i) => {
              return (
                <div key={i}>
                  <a href={el.url}>
                    <img src={el.logo} alt="" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        <Carousel />
      </div>

      <LandingPageMobile />
    </>
  );
};

export default Home;
