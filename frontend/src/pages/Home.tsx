// Material
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";

// Project resources
import Counters from "../components/Counters/Counters";
import Carousel from "../components/Carousel";
import Testimonials from "../components/Testimonials";
import StandaloneSearchBar from "../components/FindChain/StandaloneSearchBar";
import useIntersectionObserver from "../components/Counters/hooks";
import { useRef } from "react";

//Media
const ClothesImage =
  "https://images.clothingloop.org/768x/nichon_zelfportret.jpg";
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";
const Selfies = "https://images.clothingloop.org/768x/selfies.jpg";
//Logos
const SfmLogo = "https://images.clothingloop.org/160x/sfm_logo.png";
const CollActionLogo =
  "https://images.clothingloop.org/208x/logo_collaction.png";
const ImpactHubLogo =
  "https://images.clothingloop.org/600x,jpeg/logo_impacthub.svg";
const EssenseLogo =
  "https://images.clothingloop.org/208x,jpeg/essense_logo.svg";
const WdcdLogo = "https://images.clothingloop.org/160x,jpeg/logo_wdcd.png";
const DoenLogo =
  "https://images.clothingloop.org/160x/npl_buurtfonds_logo_2023.png";
const PNHLogo = "https://images.clothingloop.org/208x,jpeg/pnh_logo.png";
const MEAXLogo = "https://images.clothingloop.org/208x/meax_logo.png";

interface Supporter {
  logo: string;
  url: string;
  alt: string;
}

export default function Home() {
  const { t } = useTranslation();
  const ref = useRef() as any;

  const isVisible = useIntersectionObserver(ref, {
    root: null,
    rootMargin: "-70px",
    threshold: 0.5,
  });

  let history = useHistory();

  const supporters: Supporter[][] = [
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
        logo: MEAXLogo,
        url: "https://maex.nl/#/initiative/8be552d9-8b8a-4b9e-ac00-9d425e627696",
        alt: "MEAX",
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

      <div className="max-w-screen-xl mx-auto">
        <section className="mb-12 md:mb-24">
          <div className="hidden md:block overflow-hidden w-full absolute bg-teal-light">
            <div className="p-8 ml-[40%] rtl:ml-0 rtl:mr-[40%] pb-14 flex">
              <img src={CirclesFrame} alt="" />
              <img className="pl-2" src={CirclesFrame} alt="" />
            </div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row">
            <div className="p-6 md:pt-20 md:pl-40 rtl:md:pl-20 md:pr-20 rtl:md:pr-40 md:w-1/2 flex justify-center md:justify-end">
              <div className="max-w-screen-xs md:max-w-[500px]">
                <h1
                  className="font-serif font-bold text-accent text-8xl md:text-9xl [&_span]:text-stroke-accent mb-8 rtl:text-end"
                  dir="ltr"
                >
                  Swap, <br />
                  <span>
                    don't <br />
                    shop!
                  </span>
                </h1>
                <p>{t("swapDontShopMessage")}</p>
                <button
                  className="btn btn-primary btn-outline mt-4"
                  onClick={() => history.push("/loops/find")}
                >
                  {t("findALoop")}
                  <span className="feather feather-arrow-right ml-3 rtl:hidden" />
                  <span className="feather feather-arrow-left mr-3 ltr:hidden" />
                </button>
              </div>
            </div>
            <div className="md:pt-16 md:pr-20 lg:pr-40 rtl:pr-0 rtl:md:pl-20 rtl:lg:pl-40 md:w-1/2">
              <img
                className="w-full lg:max-w-[600px] sm:h-96 md:h-auto object-cover object-top"
                src="https://images.clothingloop.org/900x/kirsten_en_rosan.jpg"
                alt="Bringing a bag full clothes to another's doorstep"
              />
              <p className="text-sm my-1">
                {t("photo")}: Martijn van den Dobbelsteen/de Brug
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col-reverse md:flex-row items-center md:items-start md:mb-16">
            <div className="flex w-full md:w-1/2 md:justify-end">
              <iframe
                title="video about what is the Clothing Loop"
                src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
                allow="autoplay; fullscreen; picture-in-picture"
                className="w-full sm:w-[600px] aspect-video"
              ></iframe>
            </div>

            <div className="w-full md:w-1/2 px-6 mb-6 md:mb-0">
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

          <div
            className="flex flex-col md:flex-row items-center md:mb-20"
            ref={ref}
          >
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
                  className="hidden md:flex btn btn-outline btn-circle btn-secondary mt-6"
                  aria-label="find loop"
                >
                  <span className="feather feather-arrow-right rtl:hidden"></span>
                  <span className="feather feather-arrow-left ltr:hidden"></span>
                </Link>
              </div>
            </div>
            <div className="flex md:w-1/2 justify-center items-center p-20">
              <div className="relative w-full md:max-w-[600px]">
                <Link
                  to="/loops/find"
                  className={`hover:ring-[2rem] ring-secondary transition-[box-shadow] z-20 block ${
                    isVisible ? "ring-[1rem] md:ring-0" : "ring-0"
                  }`}
                >
                  <img
                    src="https://images.clothingloop.org/600x,jpeg/map_image_3.png"
                    alt="map"
                  />
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

          <div className="flex flex-col-reverse md:flex-row items-center mb-8 md:mb-40">
            <div className="relative w-full md:w-1/2 md:pr-20 flex justify-end">
              <img
                src="https://images.clothingloop.org/900x/numbered_bag_outdoors.jpg"
                className="w-full md:max-w-[600px] object-cover object-bottom h-96"
                alt="A numbered bag in front of a door and another in front of some letterboxes"
              />

              <div className="hidden md:block absolute -z-10 bg-yellow/30 w-[600px] h-5/6 bottom-[-4rem] right-[2rem]">
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
      </div>
      <div className="bg-turquoise">
        <div className="w-full sm:max-md:max-w-screen-sm md:max-w-screen-xl mx-auto">
          <section className="flex flex-col md:flex-row items-center mb-6 md:mb-20 font-bold">
            <div className="w-full md:w-1/2 flex justify-end p-6 md:px-10 xl:py-0 text-base-100">
              <div className="w-full md:max-w-screen-sm">
                <h2 className="text-6xl md:text-8xl font-serif mb-6">
                  {t("ourImpact")}
                </h2>
                <Counters />
              </div>
            </div>
            <div className="md:w-1/2 sm:max-md:pb-8">
              <video
                autoPlay
                loop
                muted
                webkit-playsinline
                playsInline
                className="object-cover object-top w-full max-h-[600px]"
                title="pages of the impact report"
                poster="https://images.clothingloop.org/x768,jpeg/impact_rapport_preview.png"
              >
                <source
                  src="https://images.clothingloop.org/original/impact_rapport.webm"
                  type="video/webm"
                />
                <source
                  src="https://images.clothingloop.org/original/impact_rapport.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </section>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto">
        <section className="flex flex-col-reverse md:flex-row items-center mb-12 md:mb-20">
          <div className="md:w-1/2">
            <img
              src={ClothesImage}
              className="object-cover object-top w-full max-h-[600px]"
              alt="Nichon taking clothes out of a Clothing Loop bag"
            />
          </div>
          <div className="md:w-1/2 px-6 md:px-10 text-secondary mb-6 md:mb-0">
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

        <section className="flex flex-col md:flex-row items-center md:items-end mb-8 md:mb-20">
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src="https://images.clothingloop.org/900x/selfies.jpg"
              alt="selfies of different people wearing clothes shared via their local Loop"
              className="w-full md:max-w-[500px] max-md:object-cover object-top h-60 md:h-auto"
            />
          </div>

          <div className="md:w-1/2 flex">
            <div className="relative p-10 md:max-w-[400px] bg-yellow/10 md:bg-transparent">
              <div className="hidden md:block -z-10 absolute w-full h-[300px] bg-yellow/10 ltr:-left-5 rtl:-right-5 bottom-0"></div>
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
            <div className="hidden md:block bg-teal-light absolute ltr:-left-10 rtl:-right-10 top-10 -z-10 w-[600px] h-[200px]">
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
          <ul className="max-w-screen-md mx-auto flex flex-wrap items-center justify-evenly mb-2 sm:mb-20">
            {supporters[0].map((el, i) => {
              return (
                <li
                  className="w-1/2 md:w-1/4 flex justify-center mb-4 md:mb-8"
                  key={i}
                >
                  <a
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
                <li
                  className="w-1/2 flex justify-center mb-8 sm:my-4 px-6"
                  key={i}
                >
                  <a
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
      </div>
      <Carousel />
    </>
  );
}
