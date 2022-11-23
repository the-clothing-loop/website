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

      <main className="container mx-auto px-1 md:px-20 pt-10">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2">
            <div className={styles.faqSection}>
              <h1 className="font-serif font-bold text-secondary text-4xl">
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
          <div className="w-full md:w-1/2">
            <div className={styles.faqSection}>
              <h1 className="font-serif font-bold text-secondary text-4xl">
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
