import { useEffect } from "react";
import { authLogout } from "../../../stores/auth";
import { addToast } from "../../../stores/toast";
import { useTranslation } from "react-i18next";
import useLocalizePath from "../util/localize_path.hooks";

export default function Logout() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  useEffect(() => {
    addToast({
      message: t("userSignedOut"),
      type: "success",
    });
    authLogout().finally(() => {
      window.location.href = localizePath("/");
    });
  }, []);

  return <div />;
}
