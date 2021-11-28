import { useState } from "react";

import { Redirect, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import Typography from "@material-ui/core/Typography";
import { Button, Divider, Box } from "@material-ui/core";

import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";

const Footer = (props: any) => {
  const { t } = useTranslation();
  return (
    <Box
      className="footer"
      bgcolor="primary.main"
      color="primary.contrastText"
      width="100%"
      height="12rem"
      position="absolute"
      bottom="0"
      padding="0 5%"
    >
      <Box
        color="inherit"
        display="flex"
        flexDirection="row"
        justifyContent="space-evenly"
        padding="0 5%"
        height="7rem"
      >
        <Button component={Link} to="/about">
          {t("About")}
        </Button>
        <Button component={Link} to="/">
          {t("FAQs")}
        </Button>
        <Button component={Link} to="/">
          {t("Help")}
        </Button>
      </Box>
      <Divider />
      <Box
        display="flex"
        flexDirection="row-reverse"
        alignItems="center"
        height="5rem"
      >
        <a href="https://www.instagram.com/ketting_kledingruil/">
          <InstagramIcon />
        </a>
        <a href="facebook.com/groups/868282617266730/">
          <FacebookIcon />
        </a>
      </Box>
    </Box>
  )
}

export default Footer;
