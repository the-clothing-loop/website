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
  const otp = query.get("apiKey");
  const emailBase64 = query.get("u");
  const chainUID = query.get("c") || "";
  const { authLoginValidate } = useContext(AuthContext);
  const { addToast, addToastError } = useContext(ToastContext);

  useEffect(() => {
    (async () => {
      let user: User | undefined;
      try {
        if (!otp) {
          throw "One time password does not exist";
        }
        if (!emailBase64) {
          throw "Email is not included in request";
        }
        user = await authLoginValidate(emailBase64, otp!, chainUID);
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
  }, [otp]);

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Login finishing</title>
        <meta name="description" content="Login finishing" />
      </Helmet>
    </>
  );
}
