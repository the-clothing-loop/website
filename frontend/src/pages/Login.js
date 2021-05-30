import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

// Project resources
import AppIcon from "../images/sfm_logo.png";

import * as firebase from "firebase/app";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const { t } = useTranslation();
  const classes = makeStyles(theme)();

  const onSubmit = async (data) => {
    await firebase.auth()
                  .sendSignInLinkToEmail(
                    data.email,
                    {
                      handleCodeInApp: false,
                      url: `https://clothinchain.com/signin?email=${data.email}`
                    }
                  );
    window.localStorage.set('emailForSignIn', data.email);
  };

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
          {t("login")}
        </Typography>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('email')} email={true} />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            {t("login")}
          </Button>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );
};

export default Login;
