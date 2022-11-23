import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

export default function MessageSubmitted(props: any) {
  const { t } = useTranslation();
  let history = useHistory();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Message Submitted</title>
        <meta name="description" content="message submitted" />
      </Helmet>

      <main className="container px-1 md:px-20 pt-10 mx-auto">
        <h1 className="font-serif font-bold text-secondary text-6xl mb-6">
          {t("thankYouForYourMessage")}
        </h1>
        <p className="mb-6">{t("weWillReplySoon")}</p>
        <div className="flex flex-row">
          <button
            className="btn btn-primary btn-outline"
            onClick={() => history.push("/")}
            key={"btn-submit-1"}
          >
            {t("home")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => history.push("/faq")}
            key={"btn-submit-1"}
          >
            {t("FAQ's")}
          </button>
        </div>
      </main>
    </>
  );
}
