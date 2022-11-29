import { Dispatch, SetStateAction, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

interface AccordionFaqTranslation {
  question: string;
  answer: string;
}

export default function FAQ() {
  const { t } = useTranslation("faq");

  const [openForParticipants, setOpenForParticipants] = useState(-1);
  const [openForHosts, setOpenForHosts] = useState(-1);

  function AccordionFaq(props: {
    question: string;
    answer: string;
    open: boolean;
    onChange: () => void;
  }) {
    return (
      <details
        className={`last-of-type:mb border-none rounded-lg p-2 ${
          props.open ? "bg-teal-light" : ""
        }`}
        open={props.open}
      >
        <summary
          tabIndex={0}
          className="p-2 marker:content-none text-lg font-medium flex justify-between items-center hover:bg-teal/10 rounded-lg"
          onClick={props.onChange}
        >
          <span>{props.question}</span>
          <span
            className={`feather ml-3 ${
              props.open ? "feather-minus" : "feather-plus"
            }`}
          />
        </summary>
        <div className="p-2">
          <p dangerouslySetInnerHTML={{ __html: props.answer }}></p>
        </div>
      </details>
    );
  }

  function setOpen(
    set: Dispatch<SetStateAction<number>>,
    index: number
  ): () => void {
    return () => {
      set((state) => (state === index ? -1 : index));
    };
  }

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

      <main className="container mx-auto px-4 md:px-20 pt-10">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 md:pr-5">
            <div className="mb-6">
              <h1 className="font-sans font-semibold text-secondary text-3xl mb-4">
                {t("faqForParticipants")}
              </h1>
              {arrParticipants.map((el, index) => (
                <AccordionFaq
                  open={openForParticipants === index}
                  onChange={setOpen(setOpenForParticipants, index)}
                  key={index}
                  question={el.question}
                  answer={el.answer}
                />
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-5">
            <div className="mb-6">
              <h1 className="font-sans font-semibold text-secondary text-3xl mb-4">
                {t("faqForHosts")}
              </h1>
              {arrHosts.map((el, index) => (
                <AccordionFaq
                  open={openForHosts === index}
                  onChange={setOpen(setOpenForHosts, index)}
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
}
