import { FormEvent, useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { contactMailSend } from "../api/contact";
import FormJup from "../util/form-jup";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";

interface FormValues {
  name: string;
  email: string;
  message: string;
}

const Contacts = () => {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const CHARACTER_LIMIT = 2000;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const values = FormJup<FormValues>(e);

    console.log(`sending mail: ${values.email}`);

    (async () => {
      try {
        await contactMailSend(values.name, values.email, values.message);
        setSubmitted(true);
      } catch (e: any) {
        console.error(e);
        setError("submit");

        addToastError(
          e?.data
            ? GinParseErrors(t, e.data)
            : t("pleaseEnterAValid.emailAddress")
        );
      }
    })();
  }

  if (submitted) {
    return <Redirect to={`/message-submitted`} />;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Contact Us</title>
        <meta name="description" content="Contact us" />
      </Helmet>
      <main className="tw-max-w-screen-sm tw-mx-auto tw-pt-10">
        <h1 className="tw-font-serif tw-font-bold tw-text-secondary tw-text-6xl tw-mb-8">
          Contact us
        </h1>
        <p className="tw-mb-6">
          Questions? Funny stories? Tips? Press enquiries? We’d love to hear
          from you! (Please do check our FAQ first!)
        </p>

        <form className="tw-flex tw-flex-col" onSubmit={onSubmit}>
          <input
            placeholder={t("name")}
            name="name"
            type="text"
            min={2}
            className="tw-input tw-input-secondary tw-mb-4"
            required
          />
          <input
            placeholder={t("email")}
            name="email"
            type="text"
            className="tw-input tw-input-secondary tw-mb-4"
            required
          />
          <textarea
            placeholder={t("yourMessage")}
            name="message"
            required
            minLength={2}
            maxLength={CHARACTER_LIMIT}
            className="tw-textarea tw-textarea-secondary tw-mb-4"
            rows={10}
          />

          <button
            type="submit"
            className={`tw-btn tw-btn-primary ${
              error ? "tw-ring-2 tw-ring-offset-2 tw-ring-error" : ""
            }`}
          >
            {t("submit")}
            <span className="feather feather-arrow-right tw-ml-4"></span>
          </button>
        </form>
      </main>
    </>
  );
};

export default Contacts;
