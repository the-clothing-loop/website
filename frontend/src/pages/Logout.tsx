import { useContext, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { AuthContext } from "../providers/AuthProvider";
import { useHistory } from "react-router-dom";
import { ToastContext } from "../providers/ToastProvider";

export const Logout = () => {
  const { authLogout } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const history = useHistory();

  const { t } = useTranslation();
  useEffect(() => {
    authLogout().finally(() => {
      addToast({
        message: t("userSignedOut"),
        type: "success",
      });
      history.push("/");
    });
  }, [history]);

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Logout</title>
        <meta name="description" content="Logout" />
      </Helmet>
    </>
  );
};
