import { useContext, useEffect, useState } from "react";
import { Redirect, useLocation, useParams } from "react-router-dom";

import { Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import theme from "../util/theme";
import { AuthContext } from "../providers/AuthProvider";

const LoginEmailFinished = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();

  const search = useLocation().search;
  const apiKey = new URLSearchParams(search).get("apiKey");
  const { authUser, authLoginValidate } = useContext(AuthContext);

  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!apiKey) {
          throw "apiKey does not exist";
        }
        await authLoginValidate(apiKey!);
      } catch (e: any) {
        setError(e?.data || typeof e == "string" ? e : JSON.stringify(e));
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
      {finished ||
        (authUser && (
          <div>
            <Alert className={classes.successAlert} severity="success">
              {t("userIsLoggedIn")}
            </Alert>
            <Redirect to="/admin/dashboard" />
          </div>
        ))}
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
