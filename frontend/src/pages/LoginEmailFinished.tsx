import { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { AuthContext } from "../providers/AuthProvider";
import { ToastContext } from "../providers/ToastProvider";

export default function LoginEmailFinished() {
  const { t } = useTranslation();
  const history = useHistory();

  const search = useLocation().search;
  const apiKey = new URLSearchParams(search).get("apiKey");
  const { authLoginValidate } = useContext(AuthContext);
  const { addToast, addToastError } = useContext(ToastContext);

  useEffect(() => {
    (async () => {
      try {
        if (!apiKey) {
          throw "apiKey does not exist";
        }
        await authLoginValidate(apiKey!);
        addToast({
          message: t("userIsLoggedIn"),
          type: "success",
        });
        history.replace("/admin/dashboard");
      } catch (err: any) {
        addToastError(t("errorLoggingIn"), 401);
        console.error("Error logging in", err);
        history.replace("/");
      }
    })();
  }, [apiKey]);

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Login finishing</title>
        <meta name="description" content="Login finishing" />
      </Helmet>
    </>
  );
}
