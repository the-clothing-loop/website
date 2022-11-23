import { useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { AuthContext } from "../providers/AuthProvider";
import { Redirect } from "react-router";
import { sleep } from "../util/sleep";
import { useHistory } from "react-router-dom";
import { ToastContext } from "../providers/ToastProvider";

export const Logout = () => {
  const [done, setDone] = useState(false);
  const { authLogout } = useContext(AuthContext);
  const { addToast, addToastError } = useContext(ToastContext);
  const history = useHistory();

  const { t } = useTranslation();
  useEffect(() => {
    Promise.all([
      authLogout().finally(() => {
        addToast({
          message: t("userSignedOut"),
          type: "success",
        });
      }),
      sleep(1700),
    ]).finally(() => {
      setDone(true);
    });
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
    </>
  );
};
