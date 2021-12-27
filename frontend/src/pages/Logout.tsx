import firebase from "firebase/app";
import "firebase/auth";
import { useEffect, useState } from "react";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

export const Logout = () => {
  const [done, setDone] = useState(false);
  const classes = makeStyles(theme as any)();

  const { t } = useTranslation();
  useEffect(() => {
    (async () => {
      await firebase.auth().signOut();
      setDone(true);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Logout</title>
        <meta name="description" content="Logout" />
      </Helmet>
      {done && (
        <Alert className={classes.successAlert} severity="success">
          {t("userSignedOut")}
        </Alert>
      )}
      {!done && (
        <Alert className={classes.infoAlert} severity="info">
          {t("userSigningOut")}
        </Alert>
      )}
    </>
  );
};
