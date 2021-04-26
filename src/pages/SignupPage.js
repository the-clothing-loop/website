import React, { useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import withStyles from "@material-ui/core/styles/withStyles";
import { withTranslation } from "react-i18next";
import AppIcon from "../images/sfm_logo.png";
import Signup from "./Signup";
// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const SignupPage = (props) => {

  const {classes} = props;
  const { t } = useTranslation();
  return (
    <Grid container className={classes.form}>
      <Grid item sm />
      <Grid item sm>
        <img
          src={AppIcon}
          alt="SFM logo"
          width="200"
          className={classes.image}
        />
        <Typography variant="h3" className={classes.pageTitle}>
          {t("signup")}
        </Typography>
        <Signup />
      </Grid>
      <Grid item sm />
    </Grid>
  );
};


const styles = (theme) => ({
  ...theme.spreadThis,
});

export default withTranslation()(withStyles(styles)(SignupPage));
