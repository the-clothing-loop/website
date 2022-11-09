// Material
import React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import theme from "../util/theme";
import { makeStyles } from "@mui/styles";

// Project resources
import { ChainsContext } from "../providers/ChainsProvider";
import Counters from "../components/Counters/Counters";
import Carousel from "../components/Carousel";
import Donations from "../components/Donations";
import Testimonials from "../components/Testimonials";

import { StandaloneSearchBar } from "../components/FindChain/StandaloneSearchBar";
//Media
const HeroImg = "images/Kirsten-Rosan.jpg";
const SectionThreeImg = "images/image_3.png";
const BagImage = "images/Utrecht.jpeg";
const MapImage = "images/map_image.png";
const ClothesImage = "images/Nichon_zelfportret.jpg";
const CirclesFrame = "images/circles.png";
const HorizontalArrow = "images/horizontal_arrow.svg";
const ArrowRightIcon = "images/right-arrow-yellow.svg";
const Selfies = "images/Selfies.jpg";
const DoorImg = "images/numbered-bag-outdoors.jpg";
//Logos
const SfmLogo = "/images/logos/sfm_logo.png";
const CollActionLogo = "/images/logos/Logo-CollAction.png";
const ImpactHubLogo = "/images/logos/Logo_impact_hub.png";
const EssenseLogo = "/images/logos/essense-logo.svg";
const WdcdLogo = "/images/logos/Logo_WDCD.png";
const DoenLogo = "/images/logos/DOEN.png";
const PNHLogo = "/images/logos/PNH_logo.png";

const Home = () => {
  const chainsCount = React.useContext(ChainsContext).length;
  const { t } = useTranslation();

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

      <div className={classes.landingPageDesktop}>
        <div className={classes.landingPageWrapper}>
          <div className="tw-w-full tw-absolute tw-bg-teal-light">
            <div className="tw-my-8 tw-ml-[40%]">
              <img src={CirclesFrame} alt="circles-frame" />
              <img className="tw-pl-2" src={CirclesFrame} alt="circles-frame" />
            </div>
          </div>
          <div className="landing-page-hero">
            <div className="hero-text-wrapper">
              <h1 dangerouslySetInnerHTML={{ __html: t("swapDontShop") }}></h1>
              <p>{t("swapDontShopMessage")}</p>
              <button
                className="slide"
                onClick={() => history.push("/loops/find")}
              >
                {t("findALoop")}
                <img src={ArrowRightIcon} alt="" className="tw-ml-5" />
              </button>
            </div>
            <div className="hero-image-wrapper">
              <div className="image-wrapper">
                <img src={HeroImg} alt="Kledingketting" />
                <p>{t("photo")}: Martijn van den Dobbelsteen/de Brug</p>
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
              <h3
                dangerouslySetInnerHTML={{ __html: t("findOutHowItWorks") }}
              ></h3>
              <p>
                <a href="/loops/find">{t("findALoopNearYou")}</a>
              </p>
            </div>
          </div>
          <div className="single-section-wrapper-2">
            <div className="text-wrapper">
              <h1>2</h1>
              <div>
                <h3>{t("joinALoop")}</h3>
                <p>{t("joinALoopMessage")}</p>
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
                <h3>{t("getReadyToSwap")}</h3>
                <p>{t("getReadyToSwapMessage")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={classes.projectNumbersWrapper}>
          <div className="inner-wrapper">
            <h1>{t("ourImpact")}</h1>
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
            <h3>{t("fromLocalLockdownToSuccess")}</h3>
            <p>{t("fromLocalLockdownToSuccessMessage")}</p>

            <h5>
              <a href="/about">{t("readMoreAboutUs")}</a>
            </h5>
          </div>
        </section>

        <Testimonials />
        <Donations />

        <div className={classes.supportersSection}>
          <div className="background-box"></div>
          <h2>{t("Partners & Sponsors")}</h2>
          <h5>
            {t("wantToSupportUsToo") + " "}
            <a href="mailto:hello@clothingloop.org">
              {t("wedLoveToHearFromYou")}
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
    </>
  );
};

export default Home;
