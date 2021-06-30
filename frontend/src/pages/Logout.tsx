import firebase from "firebase/app";
import "firebase/auth";
import { useEffect, useState } from "react";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

export const Logout = () => {
  const [done, setDone] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    (async () => {
      await firebase.auth().signOut();
      setDone(true);
    })();
  });

  if (done) {
    return <Alert severity="success">{t("userSignedOut")}</Alert>;
  } else {
    return <Alert severity="info">{t("userSigningOut")}</Alert>;
  }
}