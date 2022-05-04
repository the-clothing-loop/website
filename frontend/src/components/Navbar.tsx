import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext } from "react";

// Material UI
import { AppBar, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";

// Project resources
import LanguageSwitcher from "./LanguageSwitcher";
import { AuthContext } from "../components/AuthProvider";
import theme from "../util/theme";
import ArrowIcon from "../images/right-arrow-yellow.svg";

const Navbar = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const { userData } = useContext(AuthContext);

  let location = useLocation();

  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement

    <div>
      <AppBar position="sticky" className={classes.header}>
        <Link to="/" className={classes.logo}>
          The<span>Clothing</span> Loop
        </Link>
        <div className={classes.headerRight}>
          <div className={classes.headerNav}>
            {userData?.role === "admin" || userData?.role === "chainAdmin" ? (
              <Button
                color="inherit"
                className={classes.buttonCta}
                onClick={() =>
                  (window.location.href =
                    "https://drive.google.com/drive/folders/1iMJzIcBxgApKx89hcaHhhuP5YAs_Yb27")
                }
              >
                {t("download")}
              </Button>
            ) : null}
            {userData === null &&
            ["/loops/find", "/"].indexOf(location.pathname) !== -1 ? (
              <Button
                color="inherit"
                component={Link}
                to="/loops/new-signup"
                className={classes.buttonCta}
              >
                {t("startNewLoop")}
              </Button>
            ) : null}

            {userData === null &&
            ["/loops/find", "/"].indexOf(location.pathname) === -1 ? (
              <Button
                color="inherit"
                component={Link}
                to="/loops/find"
                className={classes.buttonCta}
              >
                {t("findLoops")}
                <img src={ArrowIcon} className="btn-icon" />
              </Button>
            ) : null}

            {userData?.role === "admin" || userData?.role === "chainAdmin" ? (
              <Link to="/admin/dashboard">{t("admin")}</Link>
            ) : null}

            {userData ? (
              <Link to="/users/logout">{t("logout")}</Link>
            ) : (
              <Link to="/users/login">{t("login")}</Link>
            )}
            {userData === null ? <Link to="/about">{t("about")}</Link> : null}
          </div>
          {/* === START publish language switcher once Dutch loops are fully migrated
            <LanguageSwitcher /> 
            ===== END */}
        </div>
      </AppBar>
    </div>
  );
};

export default Navbar;
