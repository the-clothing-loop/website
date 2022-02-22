import firebase from "firebase/app";
import "firebase/auth";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

const LoginEmailFinished = () => {
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");
  const { email } = useParams<{ email: string }>();
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  useEffect(() => {
    (async () => {
      if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
        var emailStored = window.localStorage.getItem("emailForSignIn");
        if (!emailStored || emailStored !== email) {
          setError(t("noEmailProvidedLoggingIn"));
          console.error(`Email stored: ${emailStored}`);
        } else {
          try {
            await firebase
              .auth()
              .signInWithEmailLink(email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            setFinished(true);
          } catch (e: any) {
            setError(e);
          }
        }
      }
    })();
  }, [email]);

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Login finishing</title>
        <meta name="description" content="Login finishing" />
      </Helmet>
      {finished && (
        <Alert className={classes.successAlert} severity="success">
          {t("userIsLoggedIn")}
        </Alert>
      )}
      {error && (
        <Alert className={classes.errorAlert} severity="error">
          {t("errorLoggingIn")}: {error}
        </Alert>
      )}
      {!finished && !error && (
        <Alert className={classes.infoAlert} severity="info">
          {t("finishingLoggingIn")}
        </Alert>
      )}
    </>
  );
};

export default LoginEmailFinished;
