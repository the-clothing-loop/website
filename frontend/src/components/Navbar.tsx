import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext } from "react";

import { AppBar, Button, Typography } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

// Project resources
import LanguageSwitcher from "./LanguageSwitcher";
import { AuthContext } from "../providers/AuthProvider";
import theme from "../util/theme";
import ArrowIcon from "../images/right-arrow-yellow.svg";
import Logo from "../images/logos/The_Clothing_Loop_Logo.png";

const Navbar = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const { authUser } = useContext(AuthContext);

  let location = useLocation();

  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement

    <div>
      <AppBar position="sticky" className={classes.header}>
        <Link
          to="/"
          className={classes.logo}
          style={
            location.pathname === "/"
              ? { width: "220px", height: "150px" }
              : { width: "150px", height: "100px" }
          }
        >
          <img src={Logo} alt="Logo" />
        </Link>
        <div className={classes.headerRight}>
          <div className={classes.headerNav}>
            {["/loops/find", "/"].indexOf(location.pathname) !== -1 && (
              <Button
                color="inherit"
                component={Link}
                to="/loops/new/users/signup"
                className={`${classes.buttonCta} ${classes.buttonCtaHeader}`}
              >
                {t("startNewLoop")}
              </Button>
            )}

            {authUser === null &&
            ["/loops/find", "/"].indexOf(location.pathname) === -1 ? (
              <Button
                color="inherit"
                component={Link}
                to="/loops/find"
                className={`${classes.buttonCta} ${classes.buttonCtaHeader}`}
              >
                {t("findLoops")}
                <img src={ArrowIcon} className="btn-icon" />
              </Button>
            ) : null}

            {authUser && (
              <Typography
                color="inherit"
                component={Link}
                to="/admin/dashboard"
                className={classes.buttonText}
              >
                {t("account")}
              </Typography>
            )}

            <Typography
              color="inherit"
              component={Link}
              to={authUser ? "/users/logout" : "/users/login"}
              className={classes.buttonText}
            >
              {authUser ? t("logout") : t("login")}
            </Typography>

            {authUser === null && (
              <Typography
                color="inherit"
                component={Link}
                to="/about"
                className={classes.buttonText}
              >
                {t("about")}
              </Typography>
            )}

            <LanguageSwitcher />
          </div>
        </div>
      </AppBar>
    </div>
  );
};

export default Navbar;
