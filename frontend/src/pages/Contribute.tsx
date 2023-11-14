import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Event } from "../api/types";
import { eventGetAll } from "../api/event";
import { GinParseErrors } from "../util/gin-errors";
import { ToastContext } from "../providers/ToastProvider";
import dayjs from "../util/dayjs";
import { SizeBadges } from "../components/Badges";

// Media
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";
const map = "https://images.clothingloop.org/0x0/map_image_4.png";
const ClothesImage =
  "https://images.clothingloop.org/768x/nichon_zelfportret.jpg";
// Correct github neural network goes here
const githubActivity = "";

export default function Contribute() {
  const { t } = useTranslation("contribute");
  const { addToastError, addModal } = useContext(ToastContext);
  const [event, setEvent] = useState<Event | null>(null);

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
    let video = document.getElementById("github-video") as HTMLVideoElement;
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
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <p className="prose text-xl md:text-2xl font-bold text-secondary -mt-8 mb-4">
                <Trans
                  i18nKey="donate"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aDonate: (
                      <Link
                        className="prose text-xl md:text-2xl font-bold text-secondary"
                        to="/donate"
                        target="_blank"
                      ></Link>
                    ),
                  }}
                />
              </p>
              <p className="prose text-md md:text-lg font-normal mb-8">
                <Trans
                  i18nKey="donateDesc"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aDonate: (
                      <Link
                        className="link"
                        to="/donate"
                        target="_blank"
                      ></Link>
                    ),
                  }}
                />
              </p>
              <p className="prose text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="startALoop" ns="contribute" />
              </p>
              <p className="prose text-md md:text-lg font-normal md:mb-8">
                <Trans i18nKey="startALoopDesc" ns="contribute" />
              </p>
            </div>
            <Link
              className="w-full md:w-1/2 md:pl-12"
              to="/loops/find"
              target="_blank"
            >
              <img
                src={map}
                alt="map of the clothing loop in Amsterdam area"
                className="object-cover hover:ring-[1.5rem] ring-secondary transition-[box-shadow]"
              />
            </Link>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-center mb-8 md:mb-16">
            <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
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

            <div className="w-full md:w-2/3 md:pl-12 ">
              <div className="w-full md:w-2/3 mb-8 md:mb-0">
                <p className="prose text-xl md:text-2xl font-bold text-secondary mb-4">
                  <Trans i18nKey="swap" ns="contribute" />
                </p>
                <p className="prose text-md md:text-lg font-normal mb-8">
                  <Trans
                    i18nKey="swapDesc"
                    ns="contribute"
                    components={{
                      p: <p></p>,
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
              <p className="prose text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="shareSwapStory" ns="contribute" />
              </p>
              <p className="prose text-md md:text-lg font-normal mb-8">
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
              <p className="prose text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="website" ns="contribute" />
              </p>
              <p className="prose text-md md:text-lg font-normal mb-8 md:mb-0">
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
            </div>
          </div>
          <div className="flex flex-col-reverse md:flex-row mb-8">
            <div className="w-full md:w-1/2 md:pr-4">
              <p className="prose text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans
                  i18nKey="crowdin"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aCrowdin: (
                      <a
                        className="prose text-xl md:text-2xl font-bold text-secondary"
                        href="https://crowdin.com/project/the-clothing-loop"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </p>
              <p className="prose text-md md:text-lg font-normal mb-8">
                <Trans
                  i18nKey="crowdinDesc"
                  ns="contribute"
                  components={{
                    p: <p></p>,
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
              <p className="prose text-xl md:text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="feedback" ns="contribute" />
              </p>
              <p className="prose text-md md:text-lg font-normal">
                <Trans i18nKey="feedbackDesc" ns="contribute" />
              </p>
            </div>{" "}
            <div
              onMouseEnter={() => videoHandler(true)}
              onMouseLeave={() => videoHandler(false)}
              className="w-full md:w-1/2 aspect-video pl-4 self-center"
            >
              <video
                title="Neural Network of Our Github Repository Over Time"
                src={githubActivity}
                id="github-video"
                muted={true}
              ></video>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
