import { type FormEvent, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { TwoColumnLayout } from "../components/Layouts";
import { loginEmail, loginEmailAndAddToChain } from "../../../api/login";

import FormJup from "../util/form-jup";

import { GinParseErrors } from "../util/gin-errors";
import type { Response } from "redaxios";
import { useStore } from "@nanostores/react";
import { addToast, addToastError } from "../../../stores/toast";
import { $authUser } from "../../../stores/auth";
import getQuery from "../util/query";
import useLocalizePath from "../util/localize_path.hooks";
import getLanguages from "../../../languages";

const IS_PRODUCTION =
  import.meta.env.PUBLIC_BASE_URL === "https://www.clothingloop.org";

//media
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";

export default function Login() {
  const authUser = useStore($authUser);

  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  const [error, setError] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const [chainUID, defaultEmail] = getQuery("chain", "email");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (active) return;
    setError("");
    const values = FormJup<{ email: string }>(e);

    const email = values.email;

    if (email === "") {
      setError("email");
      return;
    }

    setLoading(true);
    setActive(true);

    (async () => {
      let otp: string | undefined;
      try {
        let res: Response<unknown>;
        if (chainUID) {
          res = await loginEmailAndAddToChain(email, chainUID);
        } else {
          res = await loginEmail(email, false);
        }

        if (res.data && (res.data + "").length) {
          otp = res.data + "";
        } else {
          addToast({
            type: "success",
            message: t("loginEmailSent"),
          });
          setLoading(false);
          setTimeout(
            () => {
              setActive(false);
            },
            1000 * 60 * 2 /* 2 min */,
          );
        }
      } catch (err: any) {
        console.info("Unable to send login email", err);
        setActive(false);
        setLoading(false);
        setError("email");
        addToastError(GinParseErrors(t, err), err?.status);
      }

      if (otp) {
        let emailBase64 = btoa(email);

        window.location.href = `/users/login/validate/?u=${emailBase64}&apiKey=${otp}`;
      }
    })();
  }

  if (authUser) {
    addToast({
      type: "success",
      message: t("userIsLoggedIn"),
    });

    if (globalThis.window) {
      //@ts-ignore
      var browserLang = navigator.language || navigator.userLanguage;
      let lang = $authUser.get()?.i18n || browserLang || "en";
      if (!getLanguages(IS_PRODUCTION).find((l) => l === lang)) lang = "en";

      window.location.href = localizePath("/admin/dashboard", lang);
    }
  }

  return (
    <>
      <main className="pt-10">
        <TwoColumnLayout
          t={t}
          img="https://images.clothingloop.org/x600/login.jpg"
          alt="Nichon wearing a red jacket and holding an Ikea bag full of clothes"
          credit="Anke Teunissen"
        >
          <div className="relative sm:p-10 -mx-4 sm:mx-0">
            <div className="p-10 bg-teal-light">
              <img
                className="absolute bottom-[-12px] left-[-12px] -z-10"
                src={CirclesFrame}
                alt=""
              />
              <h1 className="font-serif font-bold text-5xl text-secondary mb-7">
                {t("login")}
              </h1>

              <form onSubmit={onSubmit} className="flex flex-col">
                <input
                  className={`input w-full invalid:input-warning ${
                    error ? "input-error" : "input-secondary"
                  }`}
                  placeholder={t("email")!}
                  type="email"
                  name="email"
                  defaultValue={defaultEmail}
                  required
                />
                {active ? (
                  <div className="text-white bg-green border-green w-full flex items-center justify-center font-semibold h-12 px-3 mt-6">
                    {t("submit")}
                    {loading ? (
                      <span className="icon-loader animate-spin ms-4"></span>
                    ) : (
                      <span className="icon-check ms-4"></span>
                    )}
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary w-full mt-6">
                    {t("submit")}
                    <span className="icon-arrow-right ml-4 rtl:hidden"></span>
                    <span className="icon-arrow-left mr-4 ltr:hidden"></span>
                  </button>
                )}
                <div className="mt-4 prose">
                  {t("newToTheClothingLoop") + " "}
                  <Trans
                    i18nKey="clickHereToRegister"
                    components={{
                      "1": (
                        <a
                          className="font-medium"
                          href={localizePath(
                            chainUID
                              ? "/loops/users/signup/?chain=" + chainUID
                              : "/users/signup",
                          )}
                        />
                      ),
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </TwoColumnLayout>
      </main>
    </>
  );
}
