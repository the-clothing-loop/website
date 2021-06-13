import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

// Material UI
import { AppBar, Toolbar, Button } from "@material-ui/core";

// Project resources
import LanguageSwitcher from "./LanguageSwitcher";


const Navbar = () => {
  const { t } = useTranslation();

  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement
    <AppBar position="sticky">
      <Toolbar className="nav-container">
        <Button color="inherit" component={Link} to="/" >{t("home")}</Button>
        <Button color="inherit" component={Link} to="/login" >{t("login")}</Button>
        <Button color="inherit" component={Link} to="/newchain" >{t("startNewChain")}</Button>
        <Button color="inherit" component={Link} to="/about" >{t("about")}</Button>
      </Toolbar>
      <LanguageSwitcher />
    </AppBar>
  );
};

export default Navbar;
