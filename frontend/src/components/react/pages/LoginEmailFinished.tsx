import { useEffect, useState } from "react";

import type { User } from "../../../api/types";
import { useTranslation } from "react-i18next";
import { authLoginValidate } from "../../../stores/auth";
import { addToast, addToastError } from "../../../stores/toast";
import getQuery from "../util/query";
import useLocalizePath from "../util/localize_path.hooks";
import isSSR from "../util/is_ssr";

export default function LoginEmailFinished() {
  const { i18n, t } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  useEffect(() => {
    if (isSSR()) return;
    const [otp, emailBase64, chainUID] = getQuery("apiKey", "u", "c");
    (async () => {
      let user: User | undefined | null;
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

        const locale = user?.i18n || "en";
        if (chainUID) {
          window.location.href = localizePath("/thankyou/", locale);
        } else {
          window.location.href = localizePath("/admin/dashboard", locale);
        }
      } catch (err: any) {
        addToastError(t("errorLoggingIn"), 401);
        console.error("Error logging in", err);
        window.location.href = localizePath("/");
      }
    })();
  }, []);

  return <div />;
}
