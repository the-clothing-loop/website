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

      <main className="tw-container tw-px-1 md:tw-px-20 tw-pt-10 tw-mx-auto">
        <h1 className="tw-font-serif tw-font-bold tw-text-secondary tw-text-6xl tw-mb-6">
          {t("thankYouForYourMessage")}
        </h1>
        <p className="tw-mb-6">{t("weWillReplySoon")}</p>
        <div className="tw-flex tw-flex-row">
          <button
            className="tw-btn tw-btn-primary tw-btn-outline"
            onClick={() => history.push("/")}
            key={"btn-submit-1"}
          >
            {t("home")}
          </button>
          <button
            className="tw-btn tw-btn-primary"
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
