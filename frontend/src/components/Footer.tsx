import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter/Newsletter";

//Mui
import { makeStyles, Typography } from "@material-ui/core";
import theme from "../util/theme";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

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
                  <Link to="#">FAQ's</Link>
                  <Link to="#">Help</Link>
                  <Link to="#">About</Link>
                </div>
                <div className={classes.footerSection}>
                  <Typography component="h5">Loops</Typography>
                  <Link to="/loops/find">Finding a loop</Link>
                  <Link to="/loops/new-signup">Starting a loop</Link>
                  <Link to="/users/login">Login</Link>
                  <Link to="/loops/new-signup">Register</Link>
                </div>
                <div className={classes.footerSection}>
                  <Typography component="h5">Find us</Typography>
                  <Link to="mailto:hello@clothingloop.com">
                    hello@clothingloop.org
                  </Link>
                  <Link to="/contacts">Contact</Link>
                </div>
              </div>
              <Newsletter />
            </div>
          ) : null}

          <div className={classes.footerLegalWrapper} id="footer">
            <div className={classes.legalLinks}>
              <Link to="#">Terms of service</Link>
              <Link to="#">Privacy</Link>
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
