import { Dispatch, SetStateAction, useState, MouseEvent } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

interface AccordionFaqTranslation {
  question: string;
  answer: string;
}

export default function FAQ() {
  const { t } = useTranslation("faq");

  const [openForParticipants, setOpenForParticipants] = useState(-1);
  const [openForHosts, setOpenForHosts] = useState(0);

  function AccordionFaq(props: {
    question: string;
    answer: string;
    open: boolean;
    onChange: () => void;
  }) {
    return (
      <details
        className={`group last-of-type:mb border-none overflow-hidden transition-[max-height] duration-700 ease-in-out ${
          props.open ? "bg-teal-light max-h-[600px]" : "max-h-[80px]"
        }`}
        open={props.open}
      >
        <summary
          tabIndex={0}
          className="marker:content-none list-none text-lg font-medium flex justify-between items-center hover:bg-teal/10 group-open:bg-teal/10 cursor-pointer"
          onClick={clickHandler}
        >
          <span className="p-3 w-full">{props.question}</span>
          <span
            className={`feather p-3 ${
              props.open ? "feather-minus" : "feather-plus"
            }`}
          />
        </summary>
        <div className="py-2 px-4 pt-0 prose">
          <p dangerouslySetInnerHTML={{ __html: props.answer }}></p>
        </div>
      </details>
    );

    function clickHandler(e: MouseEvent) {
      e.preventDefault();
      let detailsEl = (e.target as HTMLElement).parentElement!.parentElement;
      if (props.open) {
        let summaryEl = e.target as HTMLElement;
        let minHeight = summaryEl!.getBoundingClientRect().height;

        detailsEl!.classList.add("max-h-[" + minHeight + "px]");

        setTimeout(() => {
          props.onChange();
        }, 700);
      } else {
        props.onChange();
      }
    }
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

      <main className="container mx-auto px-3 md:px-20 pt-10">
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
