import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <AppBar position="fixed">
      <Toolbar className="nav-container">
        <Button color="inherit" component={Link} to="/login" >{t("login")}</Button>
        <Button color="inherit" component={Link} to="/" >{t("home")}</Button>
      </Toolbar>
      <LanguageSwitcher />
    </AppBar>
  );
};

export default Navbar;
