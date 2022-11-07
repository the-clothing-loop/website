import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter/Newsletter";

import { Typography } from "@mui/material";
import IconInstagram from "../images/icon-instagram.svg";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

const Footer = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const { authUser } = useContext(AuthContext);

  return (
    <div>
      <div
        className={classes.footer}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className={classes.footerWrapper} id="footer">
          <div className={classes.footerSections}>
            <div className={classes.footerSection}>
              <Typography component="h5">{t("learnMore")}</Typography>
              <Link to="/faq">{t("faqs")}</Link>
              <Link to="/contact-us">{t("help")}</Link>
              <Link to="/about">{t("about")}</Link>
            </div>
            <div className={classes.footerSection}>
              <Typography component="h5">{t("loops")}</Typography>
              <Link to="/loops/find">{t("findingALoop")}</Link>
              <Link to="/loops/new/users/signup">{t("startingALoop")}</Link>
              {authUser ? (
                <Link to="/users/logout">{t("logout")}</Link>
              ) : (
                <Link to="/users/login">{t("login")}</Link>
              )}
            </div>
            <div className={classes.footerSection}>
              <Typography component="h5">{t("findUs")}</Typography>
              <a href="mailto:hello@clothingloop.com">hello@clothingloop.org</a>
              <a
                href="https://www.instagram.com/theclothingloop/"
                target="_blank"
                className="feather feather-instagram tw-text-lg"
              ></a>
            </div>
          </div>
          <Newsletter />
        </div>

        <div className="tw-bg-teal bg-text-white">
          <div className="">
            <div className={classes.legalLinks}>
              <Link to="/terms-of-use">{t("termsOfService")}</Link>
              <Link to="/privacy-policy">{t("privacy")}</Link>
            </div>

            <p>
              <span className="tw-font-bold">The Clothing Loop</span> &copy;
              2022
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
