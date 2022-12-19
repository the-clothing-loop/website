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
      } catch (err: any) {
        console.error(err);
        setError("submit");

        addToastError(GinParseErrors(t, err));
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
      <main className="max-w-screen-sm mx-auto pt-10 px-4">
        <h1 className="font-serif font-bold text-secondary text-6xl mb-8">
          Contact us
        </h1>
        <p className="mb-6">
          Questions? Funny stories? Tips? Press enquiries? We’d love to hear
          from you! (Please do check our FAQ first!)
        </p>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <input
            placeholder={t("name")}
            name="name"
            type="text"
            min={2}
            className="input input-secondary mb-4"
            required
          />
          <input
            placeholder={t("email")}
            name="email"
            type="text"
            className="input input-secondary mb-4"
            required
          />
          <textarea
            placeholder={t("yourMessage")}
            name="message"
            required
            minLength={2}
            maxLength={CHARACTER_LIMIT}
            className="textarea textarea-secondary mb-4"
            rows={10}
          />

          <button
            type="submit"
            className={`btn btn-primary ${
              error ? "ring-2 ring-offset-2 ring-error" : ""
            }`}
          >
            {t("submit")}
            <span className="feather feather-arrow-right ml-4"></span>
          </button>
        </form>
      </main>
    </>
  );
};

export default Contacts;
