import { useContext, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Event } from "../api/types";
import { eventGetAll } from "../api/event";
import { GinParseErrors } from "../util/gin-errors";
import { ToastContext } from "../providers/ToastProvider";
import dayjs from "../util/dayjs";
import { SizeBadges } from "../components/Badges";
import { getLanguageFlags } from "../languages";

const translationFlags = getLanguageFlags(false);

// Media
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";
const ClothesImage =
  "https://images.clothingloop.org/768x/nichon_zelfportret.jpg";

export default function Contribute() {
  const { t } = useTranslation("contribute");
  const { addToastError } = useContext(ToastContext);
  const [event, setEvent] = useState<Event | null>(null);
  const [isHoveringDonate, setIsHoveringDonate] = useState(false);
  const githubVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.goatcounter?.count({
      path: "accessed-page-contribute",
      title: "Accessed Page:Contribute",
      event: true,
    });
    loadNextUpcomingEvent();
  }, []);

  async function loadNextUpcomingEvent() {
    try {
      const latitude = 52.377956;
      const longitude = 4.89707;
      const radius = 3000;

      const _events = await eventGetAll({ latitude, longitude, radius });
      setEvent(
        _events.data.sort((a, b) =>
          new Date(a.date) > new Date(b.date) ? 1 : -1
        )[0]
      );
    } catch (err: any) {
      addToastError(GinParseErrors(t, err), err.status);
    }
  }

  function NextUpcomingEvent({ event }: { event: Event }) {
    const { t } = useTranslation();
    const date = dayjs(event.date);

    const eventPriceValue =
      event.price_value % 1 === 0
        ? event.price_value
        : event.price_value.toFixed(2);

    let image = ClothesImage;
    if (event.image_url) image = event.image_url;
    return (
      <article className="flex flex-col bg-teal-light">
        <Link
          to="/events"
          className="relative aspect-[4/3] overflow-hidden"
          target="_blank"
        >
          <div className=" text-md absolute mt-4 right-4 text-center z-10">
            <p className="bg-teal text-white py-2 px-3">
              <span className="inline-block pr-1 font-extrabold">
                {date.format("MMMM")}
              </span>
              <span>{" " + date.format("D")}</span>
            </p>
            {event.price_currency ? (
              <p className="py-1 px-3 bg-yellow-dark text-black">
                <span className="inline-block pr-1 font-bold">
                  {event.price_currency}
                </span>
                <span className="inline-block pr-1 font-bold">
                  {eventPriceValue}
                </span>
              </p>
            ) : (
              <p className="py-1 px-3 bg-white/90 text-black">
                <span className="inline-block pr-1 font-semibold">
                  {t("priceFree")}
                </span>
              </p>
            )}
          </div>
          <img src={image} className="w-full h-full object-cover" />
        </Link>

        <div className="m-4 mb-2">
          <h2 className="text-xl text-teal font-bold">
            <Link to={"/events/" + event.uid}>{event.name}</Link>
          </h2>
        </div>
        <div className="flex-grow mx-4 mb-2">
          <span className="feather feather-map-pin mr-2 rtl:mr-0 rtl:ml-2"></span>
          <address className="inline">{event.address}</address>
        </div>
        <div className="m-4 mt-0">
          {event.genders?.length ? <SizeBadges g={event.genders} /> : null}
        </div>
      </article>
    );
  }

  async function videoHandler(play: boolean) {
    let video = githubVideo.current;
    if (!video) return;
    try {
      if (play) {
        await video.play();
      } else {
        await video.pause();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | How to Contribute</title>
        <meta
          name="description"
          content="How to Contribute to the Clothing Loop"
        />
      </Helmet>
      <main>
        <div className="max-w-screen-xl mx-auto pt-10 px-10 md:px-20">
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-16">
            {t("howToContribute")}
          </h1>
          <div className="flex flex-col md:flex-row items-center mb-8">
            <div className="w-full md:w-1/2">
              <h2 className="-mt-8 mb-4">
                <Link
                  className="text-xl md:text-2xl font-bold text-secondary group"
                  to="/donate"
                >
                  {t("donate")}
                  <span
                    className={`ms-2 align-text-bottom border rounded-full inline-flex items-center justify-center w-8 h-8 group-hover:bg-red-light group-hover:text-white transition-colors ${
                      isHoveringDonate ? "bg-red-light text-white" : "text-red"
                    }`}
                  >
                    <span className="feather feather-heart text-base font-bold" />
                  </span>
                </Link>
              </h2>
              <p className="prose font-normal mb-8">
                <Trans
                  i18nKey="donateDesc"
                  ns="contribute"
                  components={{
                    aDonate: (
                      <Link
                        className="link"
                        to="/donate"
                        target="_blank"
                        onMouseEnter={() => setIsHoveringDonate(true)}
                        onMouseLeave={() => setIsHoveringDonate(false)}
                      ></Link>
                    ),
                  }}
                />
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="startALoop" ns="contribute" />
              </h2>
              <p className="prose mb-4">
                <Trans i18nKey="startALoopDesc" ns="contribute" />
              </p>
              <Link
                to="/"
                className="btn btn-primary w-full sm:w-auto btn-outline text-black md:mb-8"
              >
                {t("startNewLoop", { ns: "translation" })}
              </Link>
            </div>
            <Link
              className="hidden md:block md:w-1/2 md:pl-12"
              to="/loops/find"
              target="_blank"
            >
              <img
                src="https://images.clothingloop.org/640x0/map_image_4.png"
                alt="map of the clothing loop in Amsterdam area"
                className="object-cover hover:ring-[1.5rem] ring-secondary transition-[box-shadow]"
              />
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center mb-8 md:mb-16">
            <div className="relative w-full md:w-1/3 mb-8 md:mb-0">
              <div className="object-cover hover:ring-[1.5rem] ring-secondary transition-[box-shadow]">
                {event ? (
                  <NextUpcomingEvent event={event} key={event.uid} />
                ) : (
                  <Link
                    to="/events"
                    className="relative aspect-[4/3] overflow-hidden"
                    target="_blank"
                  >
                    <img
                      src={ClothesImage}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                )}
              </div>
              <img
                className="hidden md:block -z-10 absolute -right-10 -top-10"
                src={CirclesFrame}
                aria-hidden
                alt=""
              />
              <img
                className="hidden md:block -z-10 absolute -left-10 -bottom-10"
                aria-hidden
                alt=""
                src={CirclesFrame}
              />
            </div>

            <div className="w-full md:w-2/3 md:pl-24 ">
              <div className="w-full md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-xl md:text-2xl font-bold text-secondary mb-4">
                  <Trans i18nKey="swap" ns="contribute" />
                </h2>
                <p className="prose font-normal mb-8">
                  <Trans
                    i18nKey="swapDesc"
                    ns="contribute"
                    components={{
                      aEvents: (
                        <Link
                          className="link font-bold"
                          to="/events"
                          target="_blank"
                        ></Link>
                      ),
                    }}
                  />
                </p>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="shareSwapStory" ns="contribute" />
              </h2>
              <p className="prose font-normal mb-8">
                <Trans
                  i18nKey="shareSwapStoryDesc"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aInstagram: (
                      <a
                        className="link"
                        href="https://www.instagram.com/theclothingloop/"
                        target="_blank"
                      />
                    ),
                    aFacebook: (
                      <a
                        className="link"
                        href="https://www.facebook.com/clothingloop/"
                        target="_blank"
                      />
                    ),
                    aLinkedin: (
                      <a
                        className="link"
                        href="https://www.linkedin.com/company/the-clothing-loop/"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="website" ns="contribute" />
              </h2>
              <p className="prose font-normal mb-3">
                <Trans
                  i18nKey="websiteDesc"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aGithub: (
                      <a
                        className="link"
                        href="https://github.com/the-clothing-loop/website/issues"
                        target="_blank"
                      />
                    ),
                    aEmail: (
                      <a
                        className="link"
                        href="mailto:hello@clothingloop.org"
                        aria-label="Our email address"
                      ></a>
                    ),
                  }}
                />
              </p>
              <div className="flex gap-4">
                <a
                  className="btn text-white hover:ring-4 ring-purple-light"
                  target="_blank"
                  href="https://github.com/the-clothing-loop/website/issues"
                >
                  <span className="feather feather-git-branch me-2" />
                  <span>Github</span>
                </a>
                <a
                  className="btn btn-outline btn-square hover:bg-[#b464a8] hover:border-[#b464a8]"
                  href="mailto:hello@clothingloop.org"
                  aria-label="Our email address"
                >
                  <span className="feather feather-mail text-lg"></span>
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse md:flex-row mb-8">
            <div className="w-full md:w-1/2 md:pr-4">
              <p className="text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans
                  i18nKey="crowdin"
                  ns="contribute"
                  components={{
                    aCrowdin: (
                      <a
                        className="underline"
                        href="https://crowdin.com/project/the-clothing-loop"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </p>
              <p className="prose font-normal mb-2">
                <Trans
                  i18nKey="crowdinDesc"
                  ns="contribute"
                  components={{
                    aCrowdin: (
                      <a
                        className="link font-bold"
                        href="https://crowdin.com/project/the-clothing-loop"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </p>
              <ol className="flex flex-wrap gap-2 mb-8">
                {translationFlags
                  .filter((f) => f.lng !== "en")
                  .map((flag) => {
                    let crowdinUrl = `https://crowdin.com/project/the-clothing-loop/${flag.lng}`;
                    if (flag.lng === "pt") {
                      crowdinUrl += "-PT";
                    }

                    return (
                      <li key={flag.lng}>
                        <a href={crowdinUrl} target="_blank">
                          <img
                            src={flag.flag}
                            alt={flag.lng}
                            className="w-10 border-4 border-transparent hover:border-teal/40 transition-colors"
                          />
                        </a>
                      </li>
                    );
                  })}
              </ol>
              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="feedback" ns="contribute" />
              </h2>
              <p className="prose font-normal mb-4">
                <Trans i18nKey="feedbackDesc" ns="contribute" />
              </p>
              <Link to="/contact-us" className="btn btn-secondary btn-outline">
                {t("contactUs", { ns: "translation" })}
                <span className="feather feather-arrow-right ml-4 rtl:hidden" />
                <span className="feather feather-arrow-left mr-4 ltr:hidden" />
              </Link>
            </div>
            <div
              onMouseEnter={() => videoHandler(true)}
              onMouseLeave={() => videoHandler(false)}
              className="relative w-full md:w-1/2 aspect-video md:pl-4 max-xs:-mx-8 max-xs:w-auto self-center mb-8 md:mb-0 group"
            >
              <video
                title="Editing files as a display of fireworks from our Github repository"
                ref={githubVideo}
                poster="https://images.clothingloop.org/672x378/gource-cut1-placeholder.jpg"
                muted
                loop
              >
                <source
                  src="https://images.clothingloop.org/original/gource-cut1.webm"
                  type="video/webm"
                />
                <source
                  src="https://images.clothingloop.org/original/gource-cut1.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="absolute bottom-6 left-7 text-white leading-none text-2xl feather feather-play group-hover:opacity-0 transition-opacity"></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
