import { useContext, useEffect, useState } from "react";
import { Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import theme from "../util/theme";
import { AuthContext } from "../providers/AuthProvider";
import { Redirect } from "react-router";
import { sleep } from "../util/sleep";
import { useHistory } from "react-router-dom";

export const Logout = () => {
  const [done, setDone] = useState(false);
  const classes = makeStyles(theme as any)();
  const { authLogout } = useContext(AuthContext);
  const history = useHistory();

  const { t } = useTranslation();
  useEffect(() => {
    (async () => {
      await authLogout();
      await sleep(1700);
      setDone(true);
    })();
  }, [history]);

  if (done) {
    return <Redirect to={"/"} />;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Logout</title>
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
