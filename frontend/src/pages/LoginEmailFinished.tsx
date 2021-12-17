import firebase from "firebase/app";
import "firebase/auth";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

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
          console.error(`Email stored: ${emailStored}`);
        } else {
          try {
            await firebase
              .auth()
              .signInWithEmailLink(email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            setFinished(true);
          } catch (e:any) {
            setError(e);
          }
        }
      }
    })();
  }, [email]);

  return <>
    <Helmet>
      <title>Clothing-Loop | Login finishing</title>
      <meta name="description" content="Login finishing"/>
    </Helmet>
    { finished && <Alert severity="success">{t("userIsLoggedIn")}</Alert> }
    { error && <Alert severity="error">{t("errorLoggingIn")}: {error}</Alert> }
    { !finished && !error && <Alert severity="info">{t("finishingLoggingIn")}</Alert> }
  </>;
};

export default LoginEmailFinished;