import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";

// Material UI
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import Alert from "@material-ui/lab/Alert";

// Project resources
import { TwoColumnLayout } from "../components/Layouts";

//media
import RightArrow from "../images/right-arrow-white.svg";
import CirclesFrame from "../images/circles.png";
import NumberedBag from "../images/numbered-bag-outdoors.png";

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

      <div className="login-wrapper">
        <div className="background-frame-login"></div>
        <img className="circles-frame-login" src={CirclesFrame} alt="" />
        <div className="login-container">
          <TwoColumnLayout img={NumberedBag}>
            <div className="login-content">
              <Typography variant="h3" className={classes.pageTitle}>
                {t("login")}
              </Typography>
              <div className={classes.pageDescription}>
                <Typography component="p" className={classes.p}>
                  {t("areYouALoopAdmin")}
                </Typography>
                <br />
                <Typography component="p" className={classes.p}>
                  {t("notPartOfTheClothingLoopYet")}
                </Typography>
                <Link className={classes.a} to="../../loops/find">
                  {t("joinAnExistingLoop")}
                </Link>
                <Typography component="p" className={classes.p}>
                  {t("or")}
                </Typography>
                <Link className={classes.a} to="../../loops/new-signup">
                  {t("startNewLoop")}
                </Link>
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
      </div>
    </>
  );
};

export default Login;
