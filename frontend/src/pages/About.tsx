import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function About() {
  const { t } = useTranslation("about");

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | About</title>
        <meta name="description" content="About The Clothing Loop" />
      </Helmet>
      <main>
        <div className="tw-max-w-screen-md tw-mx-auto tw-pt-10 tw-px-20">
          <h1 className="tw-font-serif tw-font-bold tw-text-secondary tw-text-6xl">
            {t("aboutTheClothingLoop")}
          </h1>
          <div className="tw-flex tw-justify-center tw-my-10">
            <iframe
              src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
              allow="autoplay; fullscreen; picture-in-picture"
              className="tw-w-2/3 tw-aspect-video"
            ></iframe>
          </div>

          <div className="tw-prose tw-mx-auto">
            <p>
              <Trans
                i18nKey="p"
                ns="about"
                components={{
                  p: <p></p>,
                  aFind: <Link className="tw-link" to="/loops/find"></Link>,
                }}
              ></Trans>
            </p>
          </div>
          <h2 className="tw-font-serif tw-font-bold tw-text-secondary tw-text-4xl tw-mb-6">
            {t("team")}:
          </h2>
          <Trans
            i18nKey="theClothingLoopIsAnIndependent<a>"
            ns="about"
            components={{
              aSlowFashion: (
                <a
                  href="https://slowfashion.global/"
                  target="_blank"
                  className="tw-link"
                ></a>
              ),
            }}
          ></Trans>
        </div>
        <div className="">
          <img
            src="/images/press-clippings-site.jpg"
            alt=""
            className="tw-my-10 tw-w-full tw-max-h-[600px] tw-object-contain tw-object-center"
          />
          <div className="tw-prose tw-mx-auto tw-pt-10 tw-px-20">
            <p>
              <Trans
                i18nKey="thePeople"
                ns="about"
                components={{
                  p: <p></p>,
                  imgTeam: (
                    <img
                      src="/images/Team-pics.jpg"
                      alt="faces of Paloeka and Nichon"
                      className="tw-h-60 tw-mx-auto"
                    />
                  ),
                }}
              ></Trans>
            </p>

            <p>{t("thankYou", { ns: "translation" })}</p>
          </div>
        </div>
      </main>
    </>
  );
}
