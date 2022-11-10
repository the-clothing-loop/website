// Material
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";

// Project resources
import Counters from "../components/Counters/Counters";
import Carousel from "../components/Carousel";
import Testimonials from "../components/Testimonials";

import { StandaloneSearchBar } from "../components/FindChain/StandaloneSearchBar";
//Media
const HeroImg = "/images/Kirsten-Rosan.jpg";
const MapImage = "/images/map_image.png";
const ClothesImage = "/images/Nichon_zelfportret.jpg";
const CirclesFrame = "/images/circles.png";
const Selfies = "/images/Selfies.jpg";
const DoorImg = "/images/numbered-bag-outdoors.jpg";
//Logos
const SfmLogo = "/images/logos/sfm_logo.png";
const CollActionLogo = "/images/logos/Logo-CollAction.png";
const ImpactHubLogo = "/images/logos/Logo_impact_hub.png";
const EssenseLogo = "/images/logos/essense-logo.svg";
const WdcdLogo = "/images/logos/Logo_WDCD.png";
const DoenLogo = "/images/logos/DOEN.png";
const PNHLogo = "/images/logos/PNH_logo.png";

export default function Home() {
  const { t } = useTranslation();

  let history = useHistory();

  const supporters = [
    [
      {
        logo: SfmLogo,
        url: "https://slowfashion.global/",
        alt: "Slow Fashion Movement",
      },
      {
        logo: DoenLogo,
        url: "https://www.doen.nl/en",
        alt: "Stichting Doen",
      },
      {
        logo: WdcdLogo,
        url: "https://www.whatdesigncando.com/",
        alt: "What Design Can Do",
      },
      {
        logo: ImpactHubLogo,
        url: "https://impacthub.net/",
        alt: "Impact Hub",
      },
    ],
    [
      {
        logo: PNHLogo,
        url: "https://www.noord-holland.nl/",
        alt: "Provincie Noord-Holland",
      },
      {
        logo: EssenseLogo,
        url: "https://essense.eu/",
        alt: "Essense",
      },
      {
        logo: CollActionLogo,
        url: "https://www.collaction.org/",
        alt: "CollAction",
      },
    ],
  ];

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Home</title>
        <meta name="description" content="Home" />
      </Helmet>

      <StandaloneSearchBar />

      <div className="">
        <section className="tw-mb-24">
          <div className="tw-w-full tw-absolute tw-bg-teal-light">
            <div className="tw-p-8 tw-ml-[40%] tw-pb-14 tw-flex">
              <img src={CirclesFrame} alt="" />
              <img className="tw-pl-2" src={CirclesFrame} alt="" />
            </div>
          </div>
          <div className="tw-relative tw-z-10 tw-flex">
            <div className="tw-pt-20 tw-pl-40 tw-pr-20 tw-w-1/2 tw-flex tw-justify-end">
              <div className="tw-max-w-[500px]">
                <h1
                  className="tw-font-serif tw-font-bold tw-text-accent tw-text-9xl [&_span]:tw-text-stroke-accent tw-mb-8"
                  dangerouslySetInnerHTML={{ __html: t("swapDontShop") }}
                ></h1>
                <p className="">{t("swapDontShopMessage")}</p>
                <button
                  className="tw-btn tw-btn-primary tw-btn-outline tw-mt-4"
                  onClick={() => history.push("/loops/find")}
                >
                  {t("findALoop")}
                  <span className="feather feather-arrow-right tw-ml-3" />
                </button>
              </div>
            </div>
            <div className="tw-pt-16 tw-pr-40 tw-w-1/2">
              <div>
                <img
                  className="tw-w-[30hw]"
                  src={HeroImg}
                  alt="Bringing a bag full clothes to another's doorstep"
                />
                <p className="tw-text-sm tw-my-1">
                  {t("photo")}: Martijn van den Dobbelsteen/de Brug
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center md:tw-items-start tw-mb-16">
            <div className="tw-flex md:tw-w-1/2 md:tw-justify-end tw-px-5">
              <iframe
                src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
                allow="autoplay; fullscreen; picture-in-picture"
                className="tw-w-full sm:tw-w-[600px] tw-aspect-video"
              ></iframe>
            </div>

            <div className="tw-w-full md:tw-w-1/2 tw-px-5">
              <h2 className="tw-text-accent tw-font-serif tw-font-bold tw-text-6xl tw-mb-4">
                <span className="tw-inline md:tw-block tw-mr-4 tw-font-serif tw-font-bold tw-text-9xl tw-text-stroke-accent">
                  1
                </span>
                <span
                  className="[&_br]:tw-hidden md:[&_br]:tw-block"
                  dangerouslySetInnerHTML={{ __html: t("findOutHowItWorks") }}
                ></span>
              </h2>
              <Link
                className="tw-link tw-link-accent tw-text-lg"
                to="/loops/find"
              >
                {t("findALoopNearYou")}
              </Link>
            </div>
          </div>

          <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-mb-20">
            <div className="tw-text-secondary tw-w-full md:tw-w-1/2 tw-x-10 tw-flex tw-justify-end">
              <div className="tw-max-w-[600px] tw-p-6 tw-pt-0">
                <h2 className="tw-font-serif tw-font-bold tw-text-6xl tw-mb-6">
                  <span className="tw-inline md:tw-block tw-mr-4 tw-text-9xl tw-text-stroke-secondary">
                    2
                  </span>
                  <span className="">{t("joinALoop")}</span>
                </h2>
                <p className="tw-text-lg">{t("joinALoopMessage")}</p>
                <Link
                  to="/loops/find"
                  className="tw-btn tw-btn-outline tw-btn-circle tw-btn-secondary tw-mt-6"
                >
                  <span className="feather feather-arrow-right"></span>
                </Link>
              </div>
            </div>
            <div className="tw-flex md:tw-w-1/2 tw-justify-center tw-items-center tw-p-20">
              <div className="tw-relative tw-w-full tw-max-w-[600px]">
                <Link
                  to="/loops/find"
                  className="tw-ring-0 hover:tw-ring-[2rem] tw-ring-secondary tw-transition-[box-shadow] tw-z-20 tw-block"
                >
                  <img src={MapImage} alt="map image" />
                </Link>
                <img
                  className="-tw-z-10 tw-absolute -tw-right-20 -tw-top-20"
                  src={CirclesFrame}
                />
                <img
                  className="-tw-z-10 tw-absolute -tw-left-20 -tw-bottom-20"
                  src={CirclesFrame}
                />
              </div>
            </div>
          </div>

          <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-mb-40">
            <div className="tw-relative tw-w-1/2 tw-pr-20 tw-flex tw-justify-end">
              <img src={DoorImg} className="tw-w-full tw-max-w-[600px]" />

              <div className="tw-absolute -tw-z-10 tw-bg-yellow/30 tw-w-[600px] tw-h-5/6 tw-bottom-[-4rem] tw-right-[2rem]">
                &nbsp;
              </div>
            </div>

            <div className="tw-w-1/2">
              <div className="tw-w-full tw-max-w-[600px]">
                <h2 className="tw-font-serif tw-font-bold tw-text-6xl tw-text-yellow-darkest tw-mb-6">
                  <span className="tw-inline md:tw-block md:tw-mb-4 tw-mr-4 tw-text-9xl tw-text-stroke-yellow-darkest">
                    3
                  </span>
                  {t("getReadyToSwap")}
                </h2>
                <p className="tw-text-lg">{t("getReadyToSwapMessage")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-mb-20 tw-bg-accent tw-font-bold">
          <div className="tw-w-1/2 tw-flex tw-justify-end tw-px-10 tw-text-base-100">
            <div className="tw-w-full tw-max-w-[600px]">
              <h2 className="tw-text-8xl tw-font-serif tw-mb-6">
                {t("ourImpact")}
              </h2>
              <Counters />
            </div>
          </div>

          <div className="tw-w-1/2">
            <img
              className="tw-object-cover tw-object-top tw-w-full tw-max-h-[600px]"
              src={Selfies}
              alt="selfies of different people wearing clothes shared via their local Loop"
            />
          </div>
        </section>

        <section className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-mb-20">
          <div className="tw-w-1/2">
            <img
              src={ClothesImage}
              className="tw-object-cover tw-object-top tw-w-full tw-max-h-[600px]"
              alt="Nichon taking clothes out of a Clothing Loop bag"
            />
          </div>
          <div className="tw-w-1/2 tw-px-10 tw-text-secondary">
            <div className="tw-w-full tw-max-w-[600px]">
              <h2 className="tw-font-serif tw-font-bold tw-text-6xl tw-mb-6">
                {t("fromLocalLockdownToSuccess")}
              </h2>
              <p className="tw-text-base tw-mb-3">
                {t("fromLocalLockdownToSuccessMessage")}
              </p>
              <Link
                className="tw-link tw-link-secondary tw-font-bold"
                to="/about"
              >
                {t("readMoreAboutUs")}
              </Link>
            </div>
          </div>
        </section>

        <Testimonials />

        <section className="tw-flex tw-flex-col md:tw-flex-row tw-items-end tw-mb-20">
          <div className="tw-w-1/2 tw-flex tw-justify-end">
            <img
              src="/images/TCL-Jewellery.jpg"
              alt="jewellery"
              className="tw-w-full tw-max-w-[500px]"
            />
          </div>

          <div className="tw-w-1/2 tw-flex">
            <div className="tw-relative tw-p-10 tw-max-w-[400px]">
              <div className="-tw-z-10 tw-absolute tw-w-full tw-h-[300px] tw-bg-yellow/10 -tw-left-10 tw-bottom-0"></div>
              <h2
                className="tw-font-serif tw-font-bold tw-text-4xl tw-text-primary-focus [&_span]:tw-text-2xl tw-mb-7"
                dangerouslySetInnerHTML={{
                  __html: t("smallActsCanChangeTheWorld"),
                }}
              ></h2>
              <p className="tw-mb-4">
                {t("weAreWorkingOnMakingTheClothingLoopBetter")}
              </p>
              <Link
                to="/donate"
                className="tw-btn tw-btn-outline tw-btn-primary tw-text-base tw-border-2"
              >
                {t("donate")}
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="tw-relative tw-container tw-mx-auto tw-font-serif tw-font-bold tw-text-secondary tw-mb-6">
            <div className="tw-bg-teal-light tw-absolute -tw-left-10 tw-top-10 -tw-z-10 tw-w-[600px] tw-h-[200px]">
              &nbsp;
            </div>
            <h2 className="tw-text-7xl tw-mb-4">{t("Partners & Sponsors")}</h2>
            <p className="tw-text-xl">
              {t("wantToSupportUsToo") + " "}
              <a className="tw-link" href="mailto:hello@clothingloop.org">
                {t("wedLoveToHearFromYou")}
              </a>{" "}
            </p>
          </div>
          <ul className="tw-max-w-screen-md tw-mx-auto tw-flex tw-flex-wrap tw-items-center tw-justify-evenly tw-mb-20">
            {supporters[0].map((el, i) => {
              return (
                <li className="tw-w-1/2 md:tw-w-1/4 tw-flex tw-justify-center tw-mb-4 md:tw-mb-0">
                  <a key={i} className="tw-w-40" href={el.url} target="_blank">
                    <img className="tw-w-full" src={el.logo} alt={el.alt} />
                  </a>
                </li>
              );
            })}
            {supporters[1].map((el, i) => {
              return (
                <li className="tw-w-full md:tw-w-1/3 tw-flex tw-justify-center tw-mb-4 md:tw-mb-0">
                  <a key={i} className="tw-w-52" href={el.url} target="_blank">
                    <img className="tw-w-full" src={el.logo} alt={el.alt} />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <Carousel />
      </div>
    </>
  );
}
