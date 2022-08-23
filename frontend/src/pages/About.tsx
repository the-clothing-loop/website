import { Link, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { Helmet } from "react-helmet";

import theme from "../util/theme";

//media
import PressClipping from "../images/press-clippings-site.jpg";
import TeamImg from "../images/Team-pics.jpg";
import { Trans, useTranslation, withTranslation } from "react-i18next";

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
				<Typography component="h1" className={classes.pageTitle}>
					{t("aboutTheClothingLoop")}
				</Typography>
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
							p: <Typography component="p"></Typography>,
							aFind: <Link href="./loops/find"></Link>,
						}}
					></Trans>
					<Typography component="h3" className={classes.h3}>
						{t("team")}:
					</Typography>
					<Typography component="p">
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
					</Typography>
					<img src={PressClipping} alt="" style={{ position: "relative" }} />
					<Trans
						i18nKey="thePeople"
						ns="about"
						components={{
							p: <Typography component="p"></Typography>,
							imgTeam: <img src={TeamImg} alt="" />,
						}}
					></Trans>

					<Typography component="p">
						{t("thankYou", { ns: "translation" })}
					</Typography>
				</div>
			</div>
		</>
	);
};

export default About;
