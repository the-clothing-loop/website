import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext } from "react";

// Material UI
import { AppBar, Toolbar, Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";

// Project resources
import LanguageSwitcher from "./LanguageSwitcher";
import { AuthContext } from "../components/AuthProvider";
import theme from "../util/theme";

const Navbar = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const { userData } = useContext(AuthContext);

  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement
    <AppBar position="sticky" className={classes.header}>
      <Link to="/about" className={classes.logo}>
        The Clothing Loop
      </Link>
      <div className={classes.headerRight}>
        <div className={classes.headerNav}>
          {userData?.role === "admin" || userData?.role === "chainAdmin" ? (
            <Button
              color="primary"
              variant="contained"
              component={Link}
              to="#"
            >
              {t("download")}
            </Button>
          ) : null }
          {userData === null ? (
            <Button
              color="inherit"
              component={Link}
              to="/loops"
              className={classes.buttonCta}
            >
              {t("findLoops")}
            </Button>
          ) : null }
          {userData === null ? (
            <Button
              color="inherit"
              component={Link}
              to="/loops/new-signup"
              className={classes.buttonCta}
            >
              {t("startNewLoop")}
            </Button>
          ) : null }
          {userData?.role === "admin" ? (
            <Button color="inherit" component={Link} to="/loops">
              {t("admin")}
            </Button>
          ) : null}
          {userData?.role === "chainAdmin" ? (
            <Button
              color="inherit"
              component={Link}
              to={`/loops/members/${userData.chainId}`}
            >
              {t("admin")}
            </Button>
          ) : null}
          {userData ? (
            <Button color="inherit" component={Link} to="/users/logout">
              {t("logout")}
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/users/login">
              {t("login")}
            </Button>
          )}
        </div>
        <LanguageSwitcher />
      </div>
    </AppBar>
  );
};


export default Navbar;
