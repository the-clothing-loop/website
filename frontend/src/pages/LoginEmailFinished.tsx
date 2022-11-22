import { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import theme from "../util/theme";
import { AuthContext } from "../providers/AuthProvider";

const LoginEmailFinished = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const history = useHistory();
  const location = useLocation();
  const apiKey = new URLSearchParams(location.search).get("apiKey");
  const { authUser, authLoginValidate } = useContext(AuthContext);

  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!!authUser) {
        setTimeout(() => {
          history.replace("/admin/dashboard");
        }, 1700);
        return;
      }

      try {
        if (!apiKey) {
          throw "apiKey does not exist";
        }
        await authLoginValidate(apiKey!);

        setTimeout(() => {
          history.replace("/admin/dashboard");
        }, 1700);
      } catch (e: any) {
        console.error(e);
        setError(e?.data || typeof e === "string" ? e : JSON.stringify(e));
      }
      setFinished(true);
    })();
  }, [apiKey]);

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Login finishing</title>
        <meta name="description" content="Login finishing" />
      </Helmet>
      {error && (
        <Alert className={classes.errorAlert} severity="error">
          {t("errorLoggingIn")}: {error}
        </Alert>
      )}
      {finished && !error && (
        <Alert className={classes.infoAlert} severity="info">
          {t("finishingLoggingIn")}
        </Alert>
      )}
      {authUser && (
        <Alert className={classes.successAlert} severity="success">
          {t("userIsLoggedIn")}
        </Alert>
      )}
    </>
  );
};

export default LoginEmailFinished;
