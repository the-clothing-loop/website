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

        setTimeout(() => {
          history.replace("/admin/dashboard");
        }, 1700);
      } catch (e: any) {
        addToastError(t("errorLoggingIn"));
        console.error("Error logging in", e);
        history.push("/");
        addToast({
          message: t("userIsLoggedIn"),
          type: "info",
        });
        history.push("/admin/dashboard");
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
