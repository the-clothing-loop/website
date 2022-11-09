import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter/Newsletter";

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
    <footer className="tw-bg-white tw-pt-40 tw-w-full">
      <div className="tw-grid tw-grid-cols-2">
        <div className={classes.footerSections}>
          <div className={classes.footerSection}>
            <h5>{t("learnMore")}</h5>
            <Link to="/faq">{t("faqs")}</Link>
            <Link to="/contact-us">{t("help")}</Link>
            <Link to="/about">{t("about")}</Link>
          </div>
          <div className={classes.footerSection}>
            <h5>{t("loops")}</h5>
            <Link to="/loops/find">{t("findingALoop")}</Link>
            <Link to="/loops/new/users/signup">{t("startingALoop")}</Link>
            {authUser ? (
              <Link to="/users/logout">{t("logout")}</Link>
            ) : (
              <Link to="/users/login">{t("login")}</Link>
            )}
          </div>
          <div className={classes.footerSection}>
            <h5>{t("findUs")}</h5>
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

      <div className="tw-bg-teal tw-text-white">
        <div className="tw-container tw-mx-auto tw-px-20 tw-py-4 tw-flex tw-justify-between">
          <div>
            <Link
              className="tw-btn tw-btn-ghost tw-text-white tw-text-base tw-font-normal"
              to="/terms-of-use"
            >
              {t("termsOfService")}
            </Link>
            <Link
              className="tw-btn tw-btn-ghost tw-text-white tw-text-base tw-font-normal"
              to="/privacy-policy"
            >
              {t("privacy")}
            </Link>
          </div>

          <p className="tw-flex tw-items-center" aria-label="copyright">
            <span className="tw-font-bold">The Clothing Loop</span>
            &nbsp;&copy;&nbsp;2022
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
