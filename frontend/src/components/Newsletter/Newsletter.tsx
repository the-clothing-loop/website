import { ChangeEvent, FormEvent, useState } from "react";

import { useTranslation } from "react-i18next";
import { contactNewsletterSet } from "../../api/contact";

export const Newsletter = () => {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handleSubmitClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    (async () => {
      try {
        await contactNewsletterSet(name, email, true);
      } catch (error) {
        console.error(error);
        setIsError(true);
        setTimeout(() => setIsError(false), 3000);

        return;
      }

      setSubmitted(true);
    })();
  }

  return (
    <form
      onSubmit={handleSubmitClick}
      className="tw-bg-teal-light tw-w-1/2 tw-py-14 tw-px-16"
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
          <p className="tw-mb-3">{t("subscribeToRecieveOurLatestNews")}</p>

          <div className="tw-flex tw-flex-row tw-mb-6">
            <label className="tw-form-control tw-w-52 tw-mr-4">
              <span className="tw-label tw-text-sm">{t("name")}</span>
              <input
                type="text"
                className="tw-input tw-input-bordered tw-w-full tw-input-ghost"
                value={name}
                onChange={handleNameChange}
              />
            </label>
            <label className="tw-form-control tw-w-52">
              <span className="tw-label tw-text-sm">{t("emailAddress")}</span>
              <input
                type="email"
                className="tw-input tw-input-bordered tw-w-full tw-input-ghost"
                value={email}
                onChange={handleEmailChange}
              />
            </label>
          </div>
          <div className="tw-bg-white tw-inline-block">
            <button
              className="tw-btn tw-btn-primary tw-btn-outline"
              type="submit"
            >
              {t("submit")}
              <span className="feather feather-arrow-right tw-ml-3"></span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
