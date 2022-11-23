import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { contactNewsletterSet } from "../api/contact";
import { ToastContext } from "../providers/ToastProvider";
import FormJup from "../util/form-jup";
import { GinParseErrors } from "../util/gin-errors";

interface FormValues {
  name: string;
  email: string;
}

export const Newsletter = () => {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);

  const [submitted, setSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values = FormJup<FormValues>(e);
    (async () => {
      try {
        await contactNewsletterSet(values.name, values.email, true);
      } catch (e: any) {
        console.error(e);
        addToastError(e?.data ? GinParseErrors(t, e.data) : e);

        setIsError(true);
        setTimeout(() => setIsError(false), 3000);

        return;
      }

      setSubmitted(true);
    })();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-teal-light lg:w-1/2 mb-4 lg:mb-0 p-10 lg:py-14 lg:px-16 lg:min-h-[456px]"
    >
      {submitted ? (
        <div className="max-w-[600px]">
          <p className="font-serif text-secondary font-bold text-5xl mb-4 leading-snug">
            {t("thankYouForSigningUp")}
          </p>
          <p className="">{t("youAreNowSubscribedToOurMonthlyNewsletter")}</p>
        </div>
      ) : isError ? (
        <div className="max-w-[600px]">
          <p className="font-serif text-secondary font-bold text-5xl mb-4 leading-snug">
            {t("somethingIsWrong")}
          </p>
          <p className="">{t("pleaseTryAgainInSeconds")}</p>
        </div>
      ) : (
        <div className="max-w-[600px]">
          <h2 className="font-serif text-secondary font-bold text-5xl mb-4 leading-snug">
            {t("keepUpWithOurLatestNews")}
          </h2>
          <p className="mb-8">{t("subscribeToRecieveOurLatestNews")}</p>

          <div className="flex flex-row mb-5">
            <label className="form-control w-52 mr-4">
              <input
                type="text"
                name="name"
                className="input input-bordered w-full input-secondary"
                placeholder={t("name")}
                min={3}
                required
              />
            </label>
            <label className="form-control w-52">
              <input
                type="email"
                name="email"
                placeholder={t("emailAddress")}
                className="input input-bordered w-full input-secondary"
                required
              />
            </label>
          </div>
          <div className="bg-white inline-block">
            <button className="btn btn-primary" type="submit">
              {t("submit")}
              <span className="feather feather-arrow-right ml-3"></span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
