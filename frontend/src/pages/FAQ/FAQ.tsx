import { Helmet } from "react-helmet";

import AccordionFaq from "../../components/AccordionFaq";

import styles from "./FAQ.module.css";
import { useTranslation } from "react-i18next";

interface AccordionFaqTranslation {
  question: string;
  answer: string;
}

const FAQ = () => {
  const { t } = useTranslation("faq");

  const arrHosts = t("arrHosts", {
    returnObjects: true,
    defaultValue: [],
  }) as AccordionFaqTranslation[];

  const arrParticipants = t("arrParticipants", {
    returnObjects: true,
    defaultValue: [],
  }) as AccordionFaqTranslation[];

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | FAQ's</title>
        <meta name="description" content="frequently asked questions" />
      </Helmet>

      <main className="tw-container tw-mx-auto tw-px-1 md:tw-px-20 tw-pt-10">
        <div className="tw-flex tw-flex-col md:tw-flex-row">
          <div className="tw-w-full md:tw-w-1/2">
            <div className={styles.faqSection}>
              <h1 className="tw-font-serif tw-font-bold tw-text-secondary tw-text-4xl">
                {t("faqForParticipants")}
              </h1>
              {arrParticipants.map((el, index) => (
                <AccordionFaq
                  key={index}
                  question={el.question}
                  answer={el.answer}
                />
              ))}
            </div>
          </div>
          <div className="tw-w-full md:tw-w-1/2">
            <div className={styles.faqSection}>
              <h1 className="tw-font-serif tw-font-bold tw-text-secondary tw-text-4xl">
                {t("faqForHosts")}
              </h1>
              {arrHosts.map((el, index) => (
                <AccordionFaq
                  key={index}
                  question={el.question}
                  answer={el.answer}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default FAQ;
