import { Link, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Helmet } from "react-helmet";
import theme from "../util/theme";
import { Trans, useTranslation } from "react-i18next";

const About = () => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation("about");

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | About</title>
        <meta name="description" content="About The Clothing Loop" />
      </Helmet>
      <div className={classes.legalPagesWrapper}>
        <h1 className={classes.pageTitle}>{t("aboutTheClothingLoop")}</h1>
        <div className={classes.legalPagesContentWrapper}>
          <div className="iframe-wrapper">
            <div className="iframe-content">
              <iframe
                src="https://player.vimeo.com/video/673700502?h=90c8532936&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&portrait=0&title=0&byline=0"
                allow="autoplay; fullscreen; picture-in-picture"
                className="vimeo-video"
              ></iframe>
            </div>
            <script src="https://player.vimeo.com/api/player.js"></script>
          </div>
          <Trans
            i18nKey="p"
            ns="about"
            components={{
              p: <p></p>,
              aFind: <Link href="./loops/find"></Link>,
            }}
          ></Trans>
          <h3 className={classes.h3}>{t("team")}:</h3>
          <p>
            <Trans
              i18nKey="theClothingLoopIsAnIndependent<a>"
              ns="about"
              components={{
                aSlowFashion: (
                  <Link
                    href="https://slowfashion.global/"
                    target="_blank"
                  ></Link>
                ),
              }}
            ></Trans>
          </p>
          <img
            src="/images/press-clippings-site.jpg"
            alt=""
            style={{ position: "relative" }}
          />
          <Trans
            i18nKey="thePeople"
            ns="about"
            components={{
              p: <p></p>,
              imgTeam: <img src="/images/Team-pics.jpg" alt="" />,
            }}
          ></Trans>

          <p>{t("thankYou", { ns: "translation" })}</p>
        </div>
      </div>
    </>
  );
};

export default About;
