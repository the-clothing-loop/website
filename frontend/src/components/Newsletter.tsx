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
      className="tw-bg-teal-light tw-w-1/2 tw-py-14 tw-px-16 tw-min-h-[456px]"
    >
      {submitted ? (
        <div className="tw-max-w-[600px]">
          <p className="tw-font-serif tw-text-secondary tw-font-bold tw-text-5xl tw-mb-4 tw-leading-snug">
            {t("thankYouForSigningUp")}
          </p>
          <p className="">{t("youAreNowSubscribedToOurMonthlyNewsletter")}</p>
        </div>
      ) : isError ? (
        <div className="tw-max-w-[600px]">
          <p className="tw-font-serif tw-text-secondary tw-font-bold tw-text-5xl tw-mb-4 tw-leading-snug">
            {t("somethingIsWrong")}
          </p>
          <p className="">{t("pleaseTryAgainInSeconds")}</p>
        </div>
      ) : (
        <div className="tw-max-w-[600px]">
          <h2 className="tw-font-serif tw-text-secondary tw-font-bold tw-text-5xl tw-mb-4 tw-leading-snug">
            {t("keepUpWithOurLatestNews")}
          </h2>
          <p className="tw-mb-8">{t("subscribeToRecieveOurLatestNews")}</p>

          <div className="tw-flex tw-flex-row tw-mb-5">
            <label className="tw-form-control tw-w-52 tw-mr-4">
              <input
                type="text"
                name="name"
                className="tw-input tw-input-bordered tw-w-full tw-input-secondary"
                placeholder={t("name")}
                min={3}
                required
              />
            </label>
            <label className="tw-form-control tw-w-52">
              <input
                type="email"
                name="email"
                placeholder={t("emailAddress")}
                className="tw-input tw-input-bordered tw-w-full tw-input-secondary"
                required
              />
            </label>
          </div>
          <div className="tw-bg-white tw-inline-block">
            <button className="tw-btn tw-btn-primary" type="submit">
              {t("submit")}
              <span className="feather feather-arrow-right tw-ml-3"></span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
