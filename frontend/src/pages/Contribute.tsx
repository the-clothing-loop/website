import { useEffect } from "react";
import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useToClipboard from "../util/to-clipboard.hooks";

// Media
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";
const crowdin = "../../public/images/crowdin-grid.png";
const map = "../../public/images/mapscreenshot.png";

export default function Contribute() {
  const { t } = useTranslation("contribute");

  useEffect(() => {
    window.goatcounter?.count({
      path: "accessed-page-contribute",
      title: "Accessed Page:Contribute",
      event: true,
    });
  }, []);
  const addCopyAttributes = useToClipboard();

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
          <div className="flex">
            <div className="w-1/2">
              <p className="prose font-serif text-2xl font-bold text-secondary mt-4">
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
                className=" object-cover hover:ring-[2rem] ring-secondary transition-[box-shadow] ring-[1rem] md:ring-0"
              />
            </Link>
          </div>
          <p className="prose font-serif text-2xl font-bold text-secondary mt-4">
            <Trans i18nKey="shareSwapStory" ns="contribute" />
          </p>

          <div className="flex my-4">
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

            <div className="px-3 mx-auto inline-block mb-0 pb-0 self-center">
              <ul className="flex mx-auto">
                <li className="items-center lg:order-4">
                  <a
                    href="mailto:hello@clothingloop.org"
                    aria-label="Our email address"
                    className="btn btn-circle btn-outline mr-3 rtl:mr-0 rtl:ml-3 flex justify-center hover:bg-[#b464a8] feather feather-mail text-lg"
                  ></a>
                </li>
                <li className="mb-3 items-center lg:order-2">
                  <a
                    href="https://www.instagram.com/theclothingloop/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-circle btn-outline feather feather-instagram text-lg mr-3 rtl:mr-0 rtl:ml-3 hover:bg-instagram"
                    aria-label="link to our instagram account"
                  ></a>
                </li>
                <li className="mb-3 items-center lg:order-1">
                  <a
                    href="https://www.facebook.com/clothingloop/"
                    rel="noreferrer"
                    aria-label="Our Facebook page"
                    className="flex flex-row items-center group"
                  >
                    <span className="btn btn-circle btn-outline mr-3 rtl:mr-0 rtl:ml-3 flex justify-center group-hover:text-white group-hover:border-base-content group-hover:bg-facebook feather feather-facebook text-lg"></span>
                  </a>
                </li>
                <li className="mb-3 items-center lg:order-3">
                  <a
                    href="https://www.linkedin.com/company/the-clothing-loop/"
                    rel="noreferrer"
                    aria-label="Our LinkedIn page"
                    className="flex flex-row items-center group"
                  >
                    <span className="btn btn-circle btn-outline mr-3 rtl:mr-0 rtl:ml-3 flex justify-center group-hover:text-white group-hover:border-base-content group-hover:bg-[#0a66c2] feather feather-linkedin text-lg"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex mt-4">
            <img
              src={crowdin}
              alt="crowdin"
              className="w-[40%] mx-auto object-contain object-center px-6 my-4"
            />
            <div className="my-4">
              <p className="prose font-serif text-2xl font-bold text-secondary">
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
                  <Link className="link" to="/events" target="_blank"></Link>
                ),
              }}
            />
          </p>
          <p className="prose font-serif text-2xl font-bold text-secondary mt-4">
            <Trans i18nKey="feedback" ns="contribute" />
          </p>
          <p className="prose font-serif text-lg font-normal  my-4">
            <Trans i18nKey="feedbackDesc" ns="contribute" />
          </p>


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
