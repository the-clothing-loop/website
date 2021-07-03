import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext, useRef } from "react";
import { useState, useEffect } from "react";

// Material UI
import { AppBar, Toolbar, Button } from "@material-ui/core";

// Project resources
import LanguageSwitcher from "./LanguageSwitcher";
import { AuthContext } from "../components/AuthProvider";

const Navbar = () => {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);

  
  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement
    <AppBar position="sticky">
      <Toolbar className="nav-container">
        <Button color="inherit" component={Link} to="/">
          {t("home")}
        </Button>
        <Button color="inherit" component={Link} to="/chains/find">
          {t("findChain")}
        </Button>
        <Button color="inherit" component={Link} to="/chains/new-signup">
          {t("startNewChain")}
        </Button>
        {user ? (
          <Button color="inherit" component={Link} to="/users/logout">
            {t("logout")}
          </Button>
        ) : (
          <Button color="inherit" component={Link} to="/users/login">
            {t("login")}
          </Button>
        )}

        {userData != null && userData.role === "admin" ? (
          <Button color="inherit" component={Link} to="/chains">
            {t("admin")}
          </Button>
        ) : null}

        {userData != null && userData.role === "chainAdmin" ? (
          <Button
            color="inherit"
            component={Link}
            to={`/chains/members/${userData.chainId}`}
          >
            {t("admin")}
          </Button>
        ) : null}
      </Toolbar>
      <LanguageSwitcher />
    </AppBar>
  );
};

export default Navbar;
