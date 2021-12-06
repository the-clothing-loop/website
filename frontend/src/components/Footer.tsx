import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Button, Divider, makeStyles } from "@material-ui/core";
import theme from "../util/theme";

import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";

const Footer = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  return (
    <div className={classes.footer}>
      <div className={classes.footerNav}>
        <Button component={Link} to="/about">
          {t("About")}
        </Button>
        <Button component={Link} to="/">
          {t("FAQs")}
        </Button>
        <Button component={Link} to="/">
          {t("Help")}
        </Button>
      </div>
      <Divider />
      <div className={classes.socialMediaLinkContainer}
      >
        <a href="https://www.instagram.com/ketting_kledingruil/" target="_blank">
          <InstagramIcon className={classes.socialMediaLink} />
        </a>
        <a href="facebook.com/groups/868282617266730/" target="_blank">
          <FacebookIcon className={classes.socialMediaLink} />
        </a>
      </div>
    </div>
  );
};

export default Footer;
