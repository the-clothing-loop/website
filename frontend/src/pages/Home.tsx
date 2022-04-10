// Material
import React from "react";
import { Helmet } from "react-helmet";
import { makeStyles, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";

import theme from "../util/theme";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Project resources
import { ChainsContext } from "../components/ChainsProvider";
import LandingPageMobile from "./LandingPageMobile";
import Counters from "../components/Counters/Counters";
import Carousel from "../components/Carousel";
import Donations from "../components/Donations";
import Testimonials from "../components/Testimonials";

//Media
import HeroImg from "../images/Kirsten-Rosan.jpg";
import SectionThreeImg from "../images/image_3.png";
import BagImage from "../images/Utrecht.jpeg";
import MapImage from "../images/map_image.png";
import ClothesImage from "../images/Nichon_zelfportret.jpg";
import CirclesFrame from "../images/circles.png";
import HorizontalArrow from "../images/horizontal_arrow.svg";
import ArrowRightIcon from "../images/right-arrow-yellow.svg";
import Selfies from "../images/Selfies.jpg";
import DoorImg from "../images/numbered-bag-outdoors.jpg";
//Logos
import SfmLogo from "../images/logos/sfm_logo.png";
import CollActionLogo from "../images/logos/Logo-CollAction.png";
import ImpactHubLogo from "../images/logos/Logo_impact_hub.png";
import EssenseLogo from "../images/logos/essense-logo.svg";
import WdcdLogo from "../images/logos/Logo_WDCD.png";
import DoenLogo from "../images/logos/DOEN.png";
import PNHLogo from "../images/logos/PNH_logo.png";
import { StandaloneSearchBar } from "../components/FindChain/StandaloneSearchBar";

const Home = () => {
  const chainsCount = React.useContext(ChainsContext).length;

  const classes = makeStyles(theme as any)();
  let history = useHistory();

  const supporters = [
    {
      logo: SfmLogo,
      url: "https://slowfashion.global/",
      width: "200px",
      height: "200px",
    },
    {
      logo: DoenLogo,
      url: "https://www.doen.nl/en",
      width: "150px",
      height: "150px",
    },
    {
      logo: WdcdLogo,
      url: "https://www.whatdesigncando.com/",
      width: "150px",
      height: "150px",
    },
    {
      logo: ImpactHubLogo,
      url: "https://impacthub.net/",
      width: "150px",
      height: "150px",
    },
    {
      logo: PNHLogo,
      url: "https://www.noord-holland.nl/",
      width: "250px",
      height: "auto",
    },
    {
      logo: EssenseLogo,
      url: "https://essense.eu/",
      width: "250px",
      height: "auto",
    },
    {
      logo: CollActionLogo,
      url: "https://www.collaction.org/",
      width: "250px",
      height: "auto",
    },
  ];

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Home</title>
        <meta name="description" content="Home" />
      </Helmet>

      <StandaloneSearchBar />

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
                Swap, <br />
                <span>
                  don't <br />
                  shop!
                </span>
              </h1>
              <p>
                Want to dress more sustainably? Clear out your closet and
                surprise others with items of clothing that you no longer wear?
                Spice up your wardrobe without spending a dime, or simply
                connect with neighbours? Look no further! The Clothing Loop is
                an initiative that allows people to easily swap clothes with
                others in their own neighbourhood. It’s fun, free and
                sustainable!
              </p>
              <button
                className="slide"
                onClick={() => history.push("/loops/find")}
              >
                {"Find a loop"}
                <img src={ArrowRightIcon} alt="" className="btn-icon" />
              </button>
            </div>
            <div className="hero-image-wrapper">
              <div className="image-wrapper">
                <img src={HeroImg} alt="Kledingketting" />
                <p>photo: Martijn van den Dobbelsteen/de Brug</p>
              </div>
            </div>
          </div>
        </div>

        <section className={classes.sectionsWrapper} id="section-one">
          <div className="single-section-wrapper">
            <div className="image-wrapper">
              <iframe
                src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
                allow="autoplay; fullscreen; picture-in-picture"
                className="vimeo-video"
              ></iframe>
            </div>

            <div className="text-wrapper">
              <h1>1</h1>
              <h3>
                Find out
                <br /> how it works
              </h3>
              <p>
                <a href="/loops/find">find a loop near you</a>
              </p>
            </div>
          </div>
          <div className="single-section-wrapper-2">
            <div className="text-wrapper">
              <h1>2</h1>
              <div>
                <h3>Join a Loop</h3>
                <p>
                  Want to join? We’d love to have you! Check our map and sign up
                  for a Loop in your neighbourhood. No active Loop to join in
                  your area yet? We'll help you set one up! Joining is free and
                  open to everyone.
                </p>
              </div>
            </div>
            <div className={classes.imageAnimatedWrapper}>
              <a href="./loops/find">
                <img src={MapImage} alt="map image" />
              </a>
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
              <img src={DoorImg} />
            </div>

            <div className="text-wrapper">
              <h1>3</h1>
              <div>
                <h3>Get ready to swap!</h3>
                <p>
                  The host of your local Loop will add you to the route as soon
                  as possible, and then it is only a matter of time before the
                  first bag will arrive! Find something you like, and donate
                  something that no longer suits you, before you pass the bag
                  onto the next person on the list. Don’t forget to share a
                  picture of your newfound treasure with the group!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={classes.projectNumbersWrapper}>
          <div className="inner-wrapper">
            <h1>Our impact</h1>
            <Counters />
          </div>

          <div className="images-wrapper">
            <img src={Selfies} alt="" />
          </div>
        </section>

        <section className={classes.aboutSectionWrapper}>
          <div className="image-wrapper">
            <img src={ClothesImage} alt="" />
          </div>
          <div className="text-wrapper">
            <h3>From local lockdown initiative to international success</h3>
            <p>
              The Clothing Loop started in Amsterdam. Within one year this local
              initiative became the powerful movement it is today; we saved
              mountains of clothing, neighbours got to know each other and we
              created real behavioural change towards textile consumption.
            </p>

            <h5>
              <a href="/about">Read more about us</a>
            </h5>
          </div>
        </section>

        <Testimonials />

        <div className={classes.supportersSection}>
          <div className="background-box"></div>
          <h2>Partners & Sponsors</h2>
          <h5>
            Want to support us too?{" "}
            <a href="mailto:hello@clothingloop.org">
              We'd love to hear from you!
            </a>{" "}
          </h5>
          <div className="logos-wrapper">
            {supporters.map((el, i) => {
              return (
                <div key={i} style={{ width: el.width, height: el.height }}>
                  <a href={el.url} target="_blank">
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
