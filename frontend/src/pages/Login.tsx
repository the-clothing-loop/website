import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";

import { Typography, TextField, Button, Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

// Project resources
import { TwoColumnLayout } from "../components/Layouts";

//media
import RightArrow from "../images/right-arrow-white.svg";
import CirclesFrame from "../images/circles.png";
import LoginImg from "../images/Login.jpg";

import { Helmet } from "react-helmet";
import { loginEmail } from "../api/login";

const Login = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = Yup.object({
    email: Yup.string().email(t("pleaseEnterAValid.emailAddress")),
  });

  const onSubmit = async (data: any) => {
    if (!submitted) {
      try {
        const continueUrl = `${
          process.env.REACT_APP_BASE_DOMAIN
        }/users/login-email-finished/${encodeURI(data.email)}`;
        await loginEmail(data.email);
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
        <title>The Clothing Loop | Login</title>
        <meta name="description" content="Login" />
      </Helmet>

      <div className="background-frame-login"></div>
      <img className="circles-frame-login" src={CirclesFrame} alt="" />
      <div className="login-container">
        <TwoColumnLayout img={LoginImg}>
          <div className="login-content">
            <Typography variant="h3" className={classes.pageTitle}>
              {t("login")}
            </Typography>
            <div className={classes.pageDescription}>
              <Typography component="p" className={classes.p}>
                <Trans
                  i18nKey="areYouAlreadyHosting<a>JoinAnExistingLoop"
                  components={{
                    a: (
                      <Link className={classes.a} to="../../loops/find"></Link>
                    ),
                  }}
                ></Trans>
              </Typography>
            </div>

            <Formik
              initialValues={{
                email: "",
              }}
              validationSchema={validate}
              onSubmit={async (v) => onSubmit(v)}
            >
              {(formik) => (
                <Form className="login-form">
                  <TextField
                    className={classes.textField}
                    {...formik.getFieldProps("email")}
                    label={t("email")}
                    variant="standard"
                    required
                    fullWidth
                  />
                  {formik.submitCount > 0 && formik.errors.email && (
                    <Alert severity="error">{formik.errors.email}</Alert>
                  )}
                  <div className="single-submit-btn">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      fullWidth
                    >
                      {t("submit")}
                      <img src={RightArrow} alt="" />
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
            {error && (
              <Alert className={classes.errorAlert} severity="error">
                {error}
              </Alert>
            )}
            {submitted && (
              <Alert className={classes.infoAlert} severity="info">
                {t("loginEmailSent")}
              </Alert>
            )}
          </div>
        </TwoColumnLayout>
      </div>
    </>
  );
};

export default Login;
