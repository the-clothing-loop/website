import { FormEvent, useContext, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, Redirect } from "react-router-dom";

// Project resources
import { TwoColumnLayout } from "../components/Layouts";

import { Helmet } from "react-helmet";
import { loginEmail } from "../api/login";
import { ToastContext } from "../providers/ToastProvider";
import FormJup from "../util/form-jup";
import { AuthContext } from "../providers/AuthProvider";
import { GinParseErrors } from "../util/gin-errors";

//media
const CirclesFrame = "/images/circles.png";
const LoginImg = "/images/Login.jpg";

const Login = () => {
  const { authUser } = useContext(AuthContext);
  const { addToast, addToastError } = useContext(ToastContext);
  const { t } = useTranslation();

  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const values = FormJup<{ email: string }>(e);

    const email = values.email;

    if (email === "") {
      setError("email");
      return;
    }

    (async () => {
      try {
        await loginEmail(email);
        addToast({
          type: "info",
          message: t("loginEmailSent"),
        });
      } catch (e: any) {
        console.error(e);
        setError("email");
        addToastError(
          e?.data ? GinParseErrors(t, e.data) : t("noResultsFound")
        );
      }
    })();
  }
  if (authUser) {
    addToast({
      type: "info",
      message: t("userIsLoggedIn"),
    });
    return <Redirect to="/admin/dashboard" />;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Login</title>
        <meta name="description" content="Login" />
      </Helmet>

      <main className="pt-10">
        <TwoColumnLayout img={LoginImg}>
          <div className="relative sm:p-10 -mx-4 sm:mx-0">
            <div className="p-10 bg-teal-light">
              <img
                className="absolute bottom-[-12px] left-[-12px] -z-10"
                src={CirclesFrame}
                alt=""
              />
              <h1 className="font-serif font-bold text-5xl text-secondary mb-8">
                {t("login")}
              </h1>
              <p className="leading-7 mb-6">
                <Trans
                  i18nKey="areYouAlreadyHosting<a>JoinAnExistingLoop"
                  components={{
                    a: <Link className="link" to="../../loops/find"></Link>,
                  }}
                ></Trans>
              </p>

              <form onSubmit={onSubmit} className="flex flex-col">
                <input
                  className={`input w-full invalid:input-warning ${
                    error ? "input-error" : "input-secondary"
                  }`}
                  placeholder={t("email")}
                  type="email"
                  name="email"
                  required
                />
                <button type="submit" className="btn btn-primary w-full mt-6">
                  {t("submit")}
                  <span className="feather feather-arrow-right ml-4"></span>
                </button>
              </form>
            </div>
          </div>
        </TwoColumnLayout>
      </main>
    </>
  );
};

export default Login;
