import { useEffect } from "react";
import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useToClipboard from "../util/to-clipboard.hooks";

// Media
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";
const crowdin = "../../public/images/crowdin-grid.png";
const map = "../../public/images/mapscreenshot.png";
const events = "../../public/images/events.png";
const additions = "../../public/images/additionsdeletions.png";
const network = "../../public/images/networkgraph.png";

export default function Contribute() {
  const { t } = useTranslation("contribute");

  useEffect(() => {
    window.goatcounter?.count({
      path: "accessed-page-contribute",
      title: "Accessed Page:Contribute",
      event: true,
    });
  }, []);

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
          <h1 className="font-bold text-secondary text-4xl md:text-6xl mb-16 flex">
            {t("howToContribute")}
          </h1>
          <div className="flex flex-col md:flex-row items-center mb-8">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <p className="prose text-2xl font-bold text-secondary -mt-8 mb-4">
                <Trans i18nKey="startALoop" ns="contribute" />
              </p>
              <p className="prose text-lg font-normal mb-8">
                <Trans i18nKey="startALoopDesc" ns="contribute" />
              </p>
              <p className="prose text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="shareSwapStory" ns="contribute" />
              </p>
              <p className="prose text-lg font-normal md:mb-8">
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

          <div className="flex flex-col-reverse md:flex-row md:items-center mb-8 items-center content-center">
            <div className="p-12 md:px-8 flex flex-col items-center min-w-[350px] prose font-bold bg-teal-light text-center">
              <h2 className="font-bold text-lg md:text-lg py-0 my-auto mb-8 max-w-[300px]">
                <span className="inline md:block text-5xl font-bold font-secondary tracking-wide">
                  {t("WhereToFindUs")}
                </span>
              </h2>

              {/* Social Meida Icons */}
              <div className="inline-block my-auto">
                <ul className="flex gap-4 px-0 my-0 justify-items-center">
                  <li className="list-none px-0 w-12">
                    <a
                      href="mailto:hello@clothingloop.org"
                      aria-label="Our email address"
                      className="btn btn-circle btn-outline bg-white hover:bg-[#b464a8] feather feather-mail font-bold text-lg !no-underline"
                    ></a>
                  </li>
                  <li className="list-none px-0 w-12">
                    <a
                      href="https://www.instagram.com/theclothingloop/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-circle btn-outline feather feather-instagram text-lg font-bold bg-white hover:bg-instagram !no-underline"
                      aria-label="link to our instagram account"
                    ></a>
                  </li>
                  <li className="list-none px-0 w-12">
                    <a
                      href="https://www.facebook.com/clothingloop/"
                      rel="noreferrer"
                      aria-label="Our Facebook page"
                      className="!no-underline group"
                    >
                      <span className="btn btn-circle btn-outline group-hover:text-white group-hover:border-base-content bg-white group-hover:bg-facebook feather feather-facebook text-lg"></span>
                    </a>
                  </li>
                  <li className="list-none px-0 w-12">
                    <a
                      href="https://www.linkedin.com/company/the-clothing-loop/"
                      rel="noreferrer"
                      aria-label="Our LinkedIn page"
                      className="!no-underline group"
                    >
                      <span className="btn btn-circle btn-outline group-hover:text-white group-hover:border-base-content bg-white group-hover:bg-[#0a66c2] feather feather-linkedin text-lg"></span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:ml-8 w-full md:w-2/3 mb-8 md:mb-0">
              <p className="prose text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="feedback" ns="contribute" />
              </p>
              <p className="prose text-lg font-normal">
                <Trans i18nKey="feedbackDesc" ns="contribute" />
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center mb-8 md:mb-16">
            <div className="w-full md:w-2/3 md:pr-12 mb-4 md:mb-0">
              <p className="prose text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="swap" ns="contribute" />
              </p>
              <p className="prose text-lg font-normal mb-8">
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
              <p className="prose text-2xl font-bold text-secondary mb-4">
                <Trans
                  i18nKey="crowdin"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aCrowdin: (
                      <a
                        className="prose text-2xl font-bold text-secondary"
                        href="https://crowdin.com/project/the-clothing-loop"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </p>
              <p className="prose text-lg font-normal mb-4 md:mb-0">
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
            </div>
            <div className="relative w-full md:w-1/3">
              <Link to="/events" target="_blank">
                <img
                  src={events}
                  alt="screenshot of the events page"
                  className="object-cover hover:ring-[1.5rem] ring-secondary transition-[box-shadow]"
                />
              </Link>
              <img
                className="hidden md:block -z-10 absolute -right-10 -top-10"
                src={CirclesFrame}
                aria-hidden
                alt=""
              />
              <img
                className="hidden sm:block -z-10 absolute -left-10 -bottom-10"
                aria-hidden
                alt=""
                src={CirclesFrame}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row mb-8">
            <img
              src={network}
              alt="the network graph of the Clothing Loop on GitHub"
              className="object-contain w-full md:w-1/2 md:pr-4"
            />
            <div className="w-full md:w-1/2 md:pl-4">
              <p className="prose text-2xl font-bold text-secondary mb-4">
                <Trans i18nKey="website" ns="contribute" />
              </p>
              <p className="prose text-lg font-normal mb-8">
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
              <p className="prose text-2xl font-bold text-secondary mb-4">
                <Trans
                  i18nKey="donate"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aDonate: (
                      <Link
                        className="prose text-2xl font-bold text-secondary"
                        to="/donate"
                        target="_blank"
                      ></Link>
                    ),
                  }}
                />
              </p>
              <p className="prose text-lg font-normal mb-8">
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
