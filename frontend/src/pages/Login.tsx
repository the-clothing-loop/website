import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import Alert from "@material-ui/lab/Alert";

// Project resources
import AppIcon from "../images/clothing-loop.png";

import firebase from "firebase/app";
import "firebase/auth";
import { Helmet } from "react-helmet";

const Login = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = Yup.object({
    email: Yup.string().email("Please enter a valid e-mail address"),
  });

  const onSubmit = async (data: any) => {
    if (!submitted) {
      try {
        const continueUrl = `${
          process.env.REACT_APP_BASE_DOMAIN
        }/users/login-email-finished/${encodeURI(data.email)}`;
        await firebase.auth().sendSignInLinkToEmail(data.email, {
          handleCodeInApp: true,
          url: continueUrl,
        });
        window.localStorage.setItem("emailForSignIn", data.email);
        setSubmitted(true);
      } catch (e) {
        console.error(e);
        setError(JSON.stringify(e));
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Login</title>
        <meta name="description" content="Login" />
      </Helmet>
      <Grid container className={classes.form}>
        <Grid item sm />
        <Grid item sm>
          <img
            src={AppIcon}
            alt="SFM logo"
            width="500"
            className={classes.image}
          />
          <Typography variant="h3" className={classes.pageTitle}>
            {t("login")}
          </Typography>
          <Typography component="p" className="explanatory-text">
            {
              "Login using the email address used to signup to The Clothing Loop. You'll receive an email with a link to securely login."
            }
          </Typography>
          <Formik
            initialValues={{
              email: "",
            }}
            validationSchema={validate}
            onSubmit={async (v) => onSubmit(v)}
          >
            {(formik) => (
              <Form>
                <TextField {...formik.getFieldProps("email")} />
                {formik.submitCount > 0 && formik.errors.email && (
                  <Alert severity="error">{formik.errors.email}</Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                >
                  {t("login")}
                </Button>
              </Form>
            )}
          </Formik>
          {error && <Alert severity="error">{error}</Alert>}
          {submitted && <Alert severity="info">{t("loginEmailSent")}</Alert>}
        </Grid>
        <Grid item sm />
      </Grid>
    </>
  );
};

export default Login;
