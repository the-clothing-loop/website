import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter/Newsletter";

//Mui
import { makeStyles, Typography } from "@material-ui/core";
import theme from "../util/theme";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const { userData } = useContext(AuthContext);
  let location = useLocation();

  // TODO:
  // add visibility to location.pathname == "/"
  // when new landing page is published

  return (
    <div>
      {location.pathname !== "/" ? (
        <div
          className={classes.footer}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {userData === null ? (
            <div className={classes.footerWrapper} id="footer">
              <div className={classes.footerSections}>
                <div className={classes.footerSection}>
                  <Typography component="h5">Learn more</Typography>
                  <Link to="/FAQ">FAQ's</Link>
                  <Link to="/contact-us">Help</Link>
                  <Link to="/about">About</Link>
                </div>
                <div className={classes.footerSection}>
                  <Typography component="h5">Loops</Typography>
                  <Link to="/loops/find">Finding a loop</Link>
                  <Link to="/loops/new-signup">Starting a loop</Link>
                  <Link to="/users/login">Login</Link>
                </div>
                <div className={classes.footerSection}>
                  <Typography component="h5">Find us</Typography>
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
            <div className={classes.legalLinks}>
              <Link to="/terms-of-use">Terms of service</Link>
              <Link to="/privacy-policy">Privacy</Link>
            </div>

            <p>
              <span>The Clothing Loop</span> &copy; 2022
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Footer;
