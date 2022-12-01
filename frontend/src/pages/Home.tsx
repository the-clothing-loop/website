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

      <div>
        <section className="mb-12 md:mb-24">
          <div className="hidden md:block overflow-hidden w-full absolute bg-teal-light">
            <div className="p-8 ml-[40%] pb-14 flex">
              <img src={CirclesFrame} alt="" />
              <img className="pl-2" src={CirclesFrame} alt="" />
            </div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row">
            <div className="p-6 md:pt-20 md:pl-40 md:pr-20 md:w-1/2 flex justify-center md:justify-end">
              <div className="max-w-screen-xs md:max-w-[500px]">
                <h1
                  className="font-serif font-bold text-accent text-8xl md:text-9xl [&_span]:text-stroke-accent mb-8"
                  dangerouslySetInnerHTML={{ __html: t("swapDontShop") }}
                ></h1>
                <p>{t("swapDontShopMessage")}</p>
                <button
                  className="btn btn-primary btn-outline mt-4"
                  onClick={() => history.push("/loops/find")}
                >
                  {t("findALoop")}
                  <span className="feather feather-arrow-right ml-3" />
                </button>
              </div>
            </div>
            <div className="md:pt-16 md:pr-40 md:w-1/2">
              <div>
                <img
                  className="w-[30hw]"
                  src={HeroImg}
                  alt="Bringing a bag full clothes to another's doorstep"
                />
                <p className="text-sm my-1">
                  {t("photo")}: Martijn van den Dobbelsteen/de Brug
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row items-center md:items-start mb-6 md:mb-16">
            <div className="flex md:w-1/2 md:justify-end px-6">
              <iframe
                title="video about what is the Clothing Loop"
                src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
                allow="autoplay; fullscreen; picture-in-picture"
                className="w-full sm:w-[600px] aspect-video"
              ></iframe>
            </div>

            <div className="w-full md:w-1/2 px-6">
              <h2 className="text-accent font-serif font-bold text-4xl md:text-6xl mb-4">
                <span className="inline md:block mr-4 font-serif font-bold text-9xl text-stroke-accent">
                  1
                </span>
                <span
                  className="[&_br]:hidden md:[&_br]:block"
                  dangerouslySetInnerHTML={{ __html: t("findOutHowItWorks") }}
                ></span>
              </h2>
              <Link className="link link-accent text-lg" to="/loops/find">
                {t("findALoopNearYou")}
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:mb-20">
            <div className="text-secondary w-full md:w-1/2 x-10 flex justify-end">
              <div className="md:max-w-[600px] p-6 pt-0">
                <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6">
                  <span className="inline md:block mr-4 text-9xl text-stroke-secondary">
                    2
                  </span>
                  <span>{t("joinALoop")}</span>
                </h2>
                <p className="text-lg">{t("joinALoopMessage")}</p>
                <Link
                  to="/loops/find"
                  className="btn btn-outline btn-circle btn-secondary mt-6"
                >
                  <span className="feather feather-arrow-right"></span>
                </Link>
              </div>
            </div>
            <div className="flex md:w-1/2 justify-center items-center p-20">
              <div className="relative w-full md:max-w-[600px]">
                <Link
                  to="/loops/find"
                  className="ring-[1rem] md:ring-0 hover:ring-[2rem] ring-secondary transition-[box-shadow] z-20 block"
                >
                  <img src={MapImage} alt="map" />
                </Link>
                <img
                  className="-z-10 absolute -right-20 -top-20"
                  src={CirclesFrame}
                  aria-hidden
                  alt=""
                />
                <img
                  className="-z-10 absolute -left-20 -bottom-20"
                  aria-hidden
                  alt=""
                  src={CirclesFrame}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-center mb-6 md:mb-40">
            <div className="relative md:w-1/2 pr-20 flex justify-end">
              <img
                src={DoorImg}
                className="w-full md:max-w-[600px]"
                alt="receiving a bag of clothes from another"
              />

              <div className="absolute -z-10 bg-yellow/30 w-[600px] h-5/6 bottom-[-4rem] right-[2rem]">
                &nbsp;
              </div>
            </div>

            <div className="md:w-1/2">
              <div className="w-full md:max-w-[600px] p-6">
                <h2 className="font-serif font-bold text-4xl md:text-6xl text-yellow-darkest mb-6">
                  <span className="inline md:block md:mb-4 mr-4 text-9xl text-stroke-yellow-darkest">
                    3
                  </span>
                  {t("getReadyToSwap")}
                </h2>
                <p className="text-lg">{t("getReadyToSwapMessage")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-center mb-6 md:mb-20 bg-accent font-bold">
          <div className="w-screen md:w-1/2 flex justify-end p-6 md:px-10 md:py-0 text-base-100">
            <div className="w-full md:max-w-[600px]">
              <h2 className="text-6xl md:text-8xl font-serif mb-6">
                {t("ourImpact")}
              </h2>
              <Counters />
            </div>
          </div>

          <div className="md:w-1/2">
            <img
              className="object-cover object-top w-full max-h-[600px]"
              src={Selfies}
              alt="selfies of different people wearing clothes shared via their local Loop"
            />
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-center mb-12 md:mb-20">
          <div className="md:w-1/2">
            <img
              src={ClothesImage}
              className="object-cover object-top w-full max-h-[600px] mb-6 md:mb-0"
              alt="Nichon taking clothes out of a Clothing Loop bag"
            />
          </div>
          <div className="md:w-1/2 px-6 md:px-10 text-secondary">
            <div className="w-full md:max-w-[600px]">
              <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6">
                {t("fromLocalLockdownToSuccess")}
              </h2>
              <p className="text-base mb-3">
                {t("fromLocalLockdownToSuccessMessage")}
              </p>
              <Link className="link link-secondary font-bold" to="/about">
                {t("readMoreAboutUs")}
              </Link>
            </div>
          </div>
        </section>

        <Testimonials />

        <section className="flex flex-col md:flex-row items-end mb-8 md:mb-20">
          <div className="md:w-1/2 flex justify-end">
            <img
              src="/images/TCL-Jewellery.jpg"
              alt="jewellery"
              className="w-full md:max-w-[500px]"
            />
          </div>

          <div className="md:w-1/2 flex">
            <div className="relative p-10 md:max-w-[400px] bg-yellow/10 md:bg-transparent">
              <div className="hidden md:block -z-10 absolute w-full h-[300px] bg-yellow/10 -left-5 bottom-0"></div>
              <h2
                className="font-serif font-bold text-4xl text-primary-focus [&_span]:text-2xl mb-7"
                dangerouslySetInnerHTML={{
                  __html: t("smallActsCanChangeTheWorld"),
                }}
              ></h2>
              <p className="mb-4">
                {t("weAreWorkingOnMakingTheClothingLoopBetter")}
              </p>
              <Link
                to="/donate"
                className="btn btn-outline btn-primary text-base border-2"
              >
                {t("donate")}
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="relative container mx-auto font-serif font-bold text-secondary mb-6 px-6 md:px-0">
            <div className="hidden md:block bg-teal-light absolute -left-10 top-10 -z-10 w-[600px] h-[200px]">
              &nbsp;
            </div>
            <h2 className="text-6xl md:text-7xl mb-4">
              {t("Partners & Sponsors")}
            </h2>
            <p className="text-xl">
              {t("wantToSupportUsToo") + " "}
              <a className="link" href="mailto:hello@clothingloop.org">
                {t("wedLoveToHearFromYou")}
              </a>{" "}
            </p>
          </div>
          <ul className="max-w-screen-md mx-auto flex flex-wrap items-center justify-evenly mb-2 md:mb-20">
            {supporters[0].map((el, i) => {
              return (
                <li className="w-1/2 md:w-1/4 flex justify-center mb-4 md:mb-0">
                  <a
                    key={i}
                    className="w-40"
                    href={el.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img className="w-full" src={el.logo} alt={el.alt} />
                  </a>
                </li>
              );
            })}
            {supporters[1].map((el, i) => {
              return (
                <li className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
                  <a
                    key={i}
                    className="w-52"
                    href={el.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img className="w-full" src={el.logo} alt={el.alt} />
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
