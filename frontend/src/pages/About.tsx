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
        <div className="max-w-screen-md mx-auto pt-10 px-1 md:px-20">
          <h1 className="font-serif font-bold text-secondary text-6xl">
            {t("aboutTheClothingLoop")}
          </h1>
          <div className="flex justify-center my-10">
            <iframe
              title="what is the Clothing Loop"
              src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
              allow="autoplay; fullscreen; picture-in-picture"
              className="w-2/3 aspect-video"
            ></iframe>
          </div>

          <div className="prose mx-auto">
            <p>
              <Trans
                i18nKey="p"
                ns="about"
                components={{
                  p: <p></p>,
                  aFind: <Link className="link" to="/loops/find"></Link>,
                }}
              ></Trans>
            </p>
          </div>
          <h2 className="font-serif font-bold text-secondary text-4xl mb-6">
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
                  rel="noreferrer"
                  className="link"
                ></a>
              ),
            }}
          ></Trans>
        </div>
        <div>
          <img
            src="/images/press-clippings-site.jpg"
            alt=""
            className="my-10 w-full max-h-[600px] object-contain object-center"
          />
          <div className="prose mx-auto pt-10 px-1 md:px-20">
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
                      className="h-60 mx-auto"
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
