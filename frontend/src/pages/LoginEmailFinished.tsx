import { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { AuthContext } from "../providers/AuthProvider";
import { ToastContext } from "../providers/ToastProvider";
import { User } from "../api/types";
import i18n from "../i18n";

export default function LoginEmailFinished() {
  const { t } = useTranslation();
  const history = useHistory();

  const search = useLocation().search;
  const query = new URLSearchParams(search);
  const apiKey = query.get("apiKey");
  const chainUID = query.get("c") || "";
  const { authLoginValidate } = useContext(AuthContext);
  const { addToast, addToastError } = useContext(ToastContext);

  useEffect(() => {
    (async () => {
      let user: User | undefined;
      try {
        if (!apiKey) {
          throw "apiKey does not exist";
        }
        user = await authLoginValidate(apiKey!, chainUID);
        addToast({
          message: t("userIsLoggedIn"),
          type: "success",
        });

        if (user?.i18n) {
          i18n.changeLanguage(user.i18n);
        }

        if (chainUID) {
          history.replace("/thankyou/");
        } else {
          history.replace("/admin/dashboard");
        }
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
