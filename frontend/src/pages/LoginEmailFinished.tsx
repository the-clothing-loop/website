import firebase from "firebase/app";
import "firebase/auth";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

const LoginEmailFinished = () => {
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");
  const { email } = useParams<{ email: string }>();
  const { t } = useTranslation();
  useEffect(() => {
    (async () => {
      if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
        var emailStored = window.localStorage.getItem("emailForSignIn");
        if (!emailStored || emailStored !== email) {
          setError(t("noEmailProvidedLoggingIn"));
        } else {
          try {
            await firebase
              .auth()
              .signInWithEmailLink(email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            setFinished(true);
          } catch (e) {
            setError(e);
          }
        }
      }
    })();
  });

  if (finished) {
    return <Alert severity="success">{t("userIsLoggedIn")}</Alert>;
  } else if (error) {
    return(
    <Alert severity="error">
      {t("errorLoggingIn")}: {error}
    </Alert>);
  } else {
    return <Alert severity="info">{t("finishingLoggingIn")}</Alert>;
  }
};

export default LoginEmailFinished;