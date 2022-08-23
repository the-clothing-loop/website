import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter/Newsletter";

import { Typography } from "@mui/material";
import { Instagram as InstagramIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

const Footer = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const { userData } = useContext(AuthContext);

  return (
    <div>
      <div
        className={classes.footer}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {userData === null ? (
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
                <Link to="/users/login">{t("login")}</Link>
              </div>
              <div className={classes.footerSection}>
                <Typography component="h5">{t("findUs")}</Typography>
                <a href="mailto:hello@clothingloop.com">
                  hello@clothingloop.org
                </a>
                <a
                  href="https://www.instagram.com/theclothingloop/"
                  target="_blank"
                >
                  <InstagramIcon
                    style={{
                      width: "40px",
                      height: "40px",
                    }}
                  />
                </a>
              </div>
            </div>
            <Newsletter />
          </div>
        ) : null}

        <div className={classes.footerLegalWrapper} id="footer">
          <div className={classes.legalLinksWrapper}>
            <div className={classes.legalLinks}>
              <Link to="/terms-of-use">{t("termsOfService")}</Link>
              <Link to="/privacy-policy">{t("privacy")}</Link>
            </div>

            <p>
              <span>The Clothing Loop</span> &copy; 2022
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
