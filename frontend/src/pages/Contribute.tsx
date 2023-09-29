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
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-16">
            {t("howToContribute")}
          </h1>
          <div className="flex items-center">
            <div className="w-1/2">
              <p className="prose font-serif text-2xl font-bold text-secondary -mt-8">
                <Trans i18nKey="startALoop" ns="contribute" />
              </p>
              <p className="prose font-serif text-lg font-normal my-4">
                <Trans i18nKey="startALoopDesc" ns="contribute" />
              </p>
            </div>
            <Link className="w-1/2 pl-12" to="/loops/find" target="_blank">
              <img
                src={map}
                alt="map of the clothign loop in Amsterdam area"
                className="object-cover hover:ring-[1.5rem] ring-secondary transition-[box-shadow]"
              />
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:mb-16 my-12">
            <div className="w-2/3 min-w-[350px] md:w-1/3 mx-auto mb-8 items-center prose font-serif font-bold bg-teal-light px-8 py-6 md:px-0 md:py-12 text-center">
              <h2 className="font-serif font-bold text-lg md:text-lg mb-4 my-auto md:px-6">
                <span className="inline md:block mb-8 text-5xl font-bold font-secondary">
                  {t("findUs")}
                </span>
              </h2>
              
              {/* Social Meida Icons */}
              <div >
                <ul className="grid grid-cols-4 md:grid-cols-4 gap-x-0 gap-y-0 md:gap-x-8 md:gap-y-2 px-0 my-0 justify-items-center md:px-12">
                  <li className="list-none lg:order-4 px-0 w-12">
                    <a
                      href="mailto:hello@clothingloop.org"
                      aria-label="Our email address"
                      className="btn btn-circle btn-outline hover:bg-[#b464a8] feather feather-mail font-bold text-lg !no-underline"
                    ></a>
                  </li>
                  <li className="list-none lg:order-2 px-0 w-12">
                    <a
                      href="https://www.instagram.com/theclothingloop/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-circle btn-outline feather feather-instagram text-lg font-bold hover:bg-instagram !no-underline"
                      aria-label="link to our instagram account"
                    ></a>
                  </li>
                  <li className="list-none lg:order-1 px-0 w-12">
                    <a
                      href="https://www.facebook.com/clothingloop/"
                      rel="noreferrer"
                      aria-label="Our Facebook page"
                      className="!no-underline"
                    >
                      <span className="btn btn-circle btn-outline group-hover:text-white group-hover:border-base-content group-hover:bg-facebook feather feather-facebook text-lg"></span>
                    </a>
                  </li>
                  <li className="list-none lg:order-3 px-0 w-12">
                    <a
                      href="https://www.linkedin.com/company/the-clothing-loop/"
                      rel="noreferrer"
                      aria-label="Our LinkedIn page"
                      className="!no-underline"
                    >
                      <span className="btn btn-circle btn-outline group-hover:text-white group-hover:border-base-content group-hover:bg-[#0a66c2] feather feather-linkedin text-lg"></span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:ml-8 w-full md:w-2/3">
              <p className="prose font-serif text-2xl font-bold text-secondary my-4">
                <Trans i18nKey="shareSwapStory" ns="contribute" />
              </p>
              <p className="prose font-serif text-lg font-normal mt-0">
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

              <p className="prose font-serif text-2xl font-bold text-secondary mt-8">
                <Trans i18nKey="feedback" ns="contribute" />
              </p>
              <p className="prose font-serif text-lg font-normal my-4">
                <Trans i18nKey="feedbackDesc" ns="contribute" />
              </p>
            </div>
          </div>

          <div className="flex items-center mt-12">
            <a
              className="w-[40%] pr-12"
              href="https://crowdin.com/project/the-clothing-loop"
              target="_blank"
            >
              <img
                src={crowdin}
                alt="crowdin"
                className="object-cover hover:ring-[1.5rem] ring-secondary transition-[box-shadow]"
              />
            </a>

            <div className="w-[60%] self-center">
              <p className="prose font-serif text-2xl font-bold text-secondary -mt-8">
                <Trans
                  i18nKey="crowdin"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aCrowdin: (
                      <a
                        className="prose font-serif text-2xl font-bold text-secondary"
                        href="https://crowdin.com/project/the-clothing-loop"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </p>
              <p className="prose font-serif text-lg font-normal my-4">
                <Trans
                  i18nKey="crowdinDesc"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aCrowdin: (
                      <a
                        className="link"
                        href="https://crowdin.com/project/the-clothing-loop"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </p>
            </div>
          </div>
          <div className="flex items-center mt-12">
            <div className="w-1/2">
              <p className="prose font-serif text-2xl font-bold text-secondary mt-4">
                <Trans i18nKey="swap" ns="contribute" />
              </p>
              <p className="prose font-serif text-lg font-normal my-4">
                <Trans
                  i18nKey="swapDesc"
                  ns="contribute"
                  components={{
                    p: <p></p>,
                    aEvents: (
                      <Link
                        className="link"
                        to="/events"
                        target="_blank"
                      ></Link>
                    ),
                  }}
                />
              </p>
            </div>
            <Link className="w-1/2 pl-12" to="/events" target="_blank">
              <img
                src={events}
                alt="events page"
                className="object-cover hover:ring-[1.5rem] ring-secondary transition-[box-shadow]"
              />
            </Link>
          </div>

          <p className="prose font-serif text-2xl font-bold text-secondary mt-4">
            <Trans i18nKey="website" ns="contribute" />
          </p>
          <p className="prose font-serif text-lg font-normal my-4">
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
          <p className="prose font-serif text-2xl font-bold text-secondary mt-4">
            <Trans
              i18nKey="donate"
              ns="contribute"
              components={{
                p: <p></p>,
                aDonate: (
                  <Link
                    className="prose font-serif text-2xl font-bold text-secondary"
                    to="/donate"
                    target="_blank"
                  ></Link>
                ),
              }}
            />
          </p>
          <p className="prose font-serif text-lg font-normal my-4">
            <Trans
              i18nKey="donateDesc"
              ns="contribute"
              components={{
                p: <p></p>,
                aDonate: (
                  <Link className="link" to="/donate" target="_blank"></Link>
                ),
              }}
            />
          </p>
        </div>
      </main>
    </>
  );
}
