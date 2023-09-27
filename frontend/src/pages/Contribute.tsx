import { useEffect } from "react";
import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
            <div>
              <div className="prose font-serif text-2xl font-bold text-secondary py-4">
                <p>
                  <Trans i18nKey="startALoop" ns="contribute" />
                </p>
                <div className="prose font-serif text-lg font-normal">
                  <p>
                    <Trans i18nKey="startALoopDesc" ns="contribute" />
                  </p>
                </div>
              </div>
              <div className="prose font-serif text-2xl font-bold text-secondary">
                <p>
                  <Trans i18nKey="shareSwapStory" ns="contribute" />
                </p>
                <div className="prose font-serif text-lg font-normal">
                  <p>
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
                </div>
              </div>
            </div>
            <img
              src={map}
              alt="map of the clothign loop in Amsterdam area"
              className="w-1/2 mx-auto object-contain object-center px-6 mb-6 md:mb-0 mt-12"
            />
          </div>

          <div className="flex my-12">
            <img
              src={crowdin}
              alt="crowdin"
              className="w-[40%] mx-auto object-contain object-center px-6"
            />
            <div>
              <div className="prose font-serif text-2xl font-bold text-secondary">
                <p>
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
                <div className="prose font-serif text-lg font-normal">
                  <p>
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
              <div className="prose font-serif text-2xl font-bold text-secondary">
                <p>
                  <Trans i18nKey="swap" ns="contribute" />
                </p>
                <div className="prose font-serif text-lg font-normal">
                  <p>
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
              </div>
            </div>
          </div>
          <div className="prose font-serif text-2xl font-bold text-secondary">
            <p>
              <Trans i18nKey="feedback" ns="contribute" />
            </p>
            <div className="prose font-serif text-lg font-normal">
              <p>
                <Trans i18nKey="feedbackDesc" ns="contribute" />
              </p>
            </div>
          </div>
          <div className="prose font-serif text-2xl font-bold text-secondary">
            <p>
              <Trans i18nKey="website" ns="contribute" />
            </p>
            <div className="prose font-serif text-lg font-normal">
              <p>
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
          <div className="prose font-serif text-2xl font-bold text-secondary">
            <p>
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
            <div className="prose font-serif text-lg font-normal">
              <p>
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
