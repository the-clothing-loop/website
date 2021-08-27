import firebase from "firebase/app";
import "firebase/auth";
import { useEffect, useState } from "react";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

export const Logout = () => {
  const [done, setDone] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    (async () => {
      await firebase.auth().signOut();
      setDone(true);
    })();
  }, []);

  return <>
    <Helmet>
      <title>Clothing-Loop | Logout</title>
      <meta name="description" content="Logout"/>
    </Helmet>
    { done && <Alert severity="success">{t("userSignedOut")}</Alert> }
    { !done && <Alert severity="info">{t("userSigningOut")}</Alert> }
  </>;
}