import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// Media
const CirclesFrame =
  "https://images.clothingloop.org/0x0/circles.png";

export default function About() {
  const { t } = useTranslation("about");

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | About</title>
        <meta name="description" content="About The Clothing Loop" />
      </Helmet>
      <main>
        <div className="max-w-screen-xl mx-auto pt-10 px-0 md:px-20">
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-16 px-6">
            {t("aboutTheClothingLoop")}
          </h1>
          <div className="flex flex-col-reverse md:flex-row items-center mb-10 md:mb-8">
            <div className="prose mx-auto w-full md:w-1/2 px-6 md:mb-0">
              <p>
                <Trans
                  i18nKey="p1"
                  ns="about"
                  components={{
                    p: <p></p>,
                    aFind: <Link className="link" to="/loops/find"></Link>,
                  }}
                ></Trans>
              </p>
            </div>
            <div className="flex md:w-1/2 justify-center px-0 md:px-6">
              <div className="relative w-full md:max-w-[600px] mb-6 md:mb-16">
                <iframe
                  title="what is the Clothing Loop"
                  src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="w-full aspect-video"
                ></iframe>
                <img
                  className="max-sm:hidden -z-10 absolute -right-10 -top-10"
                  src={CirclesFrame}
                  aria-hidden
                  alt=""
                />
                <img
                  className="max-sm:hidden -z-10 absolute -left-10 -bottom-10"
                  aria-hidden
                  alt=""
                  src={CirclesFrame}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:mb-16">
            <div className="md:w-1/3 mb-6 md:mb-0 mx-auto items-center prose font-serif font-bold bg-teal-light p-12 md:p-8">
              <h2 className="font-serif font-bold text-lg md:text-lg mb-4 my-auto">
                <span className="inline md:block mb-8 text-5xl text-stroke-accent">
                  {t("wantToJoin")}
                </span>
              </h2>
              <p className="text-lg tracking-wide">
                <Trans
                  i18nKey="callToAction"
                  ns="about"
                  components={{
                    p: <p></p>,
                    aFind: (
                      <Link
                        className="link text-secondary font-bold"
                        to="/loops/find"
                      ></Link>
                    ),
                  }}
                ></Trans>
              </p>
            </div>

            <div className="prose md:w-2/3 mb-6 md:mb-0 px-6 mx-auto">
              <p>
                <Trans
                  i18nKey="p2"
                  ns="about"
                  components={{
                    p: <p></p>,
                    aFind: <Link className="link" to="/loops/find"></Link>,
                  }}
                ></Trans>
              </p>
            </div>
          </div>

          <div>
            <img
              src="https://ucarecdn.com/a1229917-0a48-4401-9e16-d8939509c0b8/-/resize/x600/-/format/auto/-/quality/smart/pressclippingssite.jpg"
              alt="Press clippings related to Clothing Loop"
              className="my-10 mx-auto w-full lg:w-5/6 object-contain object-center px-6"
            />
          </div>

          <div className="px-6">
            <h2 className="font-serif font-bold text-secondary text-4xl mb-6">
              {t("team")}:
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start mb-6 md:mb-0">
            <div className="prose md:w-1/2 mx-auto px-6">
              <p>
                <Trans
                  i18nKey="theClothingLoopIsAnIndependent<a>"
                  ns="about"
                  components={{
                    aSlowFashion: (
                      <a
                        href="https://slowfashion.global/"
                        target="_blank"
                        rel="noreferrer"
                        className="link"
                      ></a>
                    ),
                  }}
                ></Trans>
              </p>
              <p>
                <Trans
                  i18nKey="thePeople1"
                  ns="about"
                  components={{
                    p: <p></p>,
                    imgTeam: (
                      <img
                        src="https://images.clothingloop.org/88ce5a09-71f6-4b03-aa10-fc3a172f7f4e/-/resize/x240/-/format/auto/-/quality/smart/Teampics.jpg"
                        alt="faces of Paloeka and Nichon"
                        className="-2/3 mx-auto object-contain object-center mb-6 md:mb-0"
                      />
                    ),
                  }}
                ></Trans>
              </p>
            </div>
            <div className="prose mx-auto md:w-1/2 px-6">
              <p>
                <Trans
                  i18nKey="thePeople2"
                  ns="about"
                  components={{
                    p: <p></p>,
                    aFind: <Link className="link" to="/loops/find"></Link>,
                  }}
                ></Trans>
              </p>
              <p>{t("thankYou", { ns: "translation" })}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
