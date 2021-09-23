import { useState } from "react";
import { Redirect, Link } from "react-router-dom";

//Project resources
import Typography from "@material-ui/core/Typography";

import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";

const Footer = () => {
  return (
    <div className="footer">
      <Typography component='h1' variant='h4'>Follow us</Typography>
      <a href="https://www.instagram.com/ketting_kledingruil/" target="_blank">
        <InstagramIcon />
      </a>
      <a href="facebook.com/groups/868282617266730/" target="_blank">
        <FacebookIcon />
      </a>
    </div>
  );
};

export default Footer;
