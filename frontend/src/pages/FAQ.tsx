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
    id: number;
    onChange: () => void;
  }) {
    return (
      <details
        className={`group last-of-type:mb border-none overflow-hidden ${
          props.open
            ? "bg-teal-light max-h-[1000px] transition-[max-height] duration-300 ease-out"
            : "transition-[min-height] duration-200 ease-out min-h-[60px]"
        }`}
        open={props.open}
        id={"detailsID" + props.id}
      >
        <summary
          tabIndex={0}
          className="p-3 marker:content-none list-none text-lg font-medium flex justify-between items-center hover:bg-teal/10 group-open:bg-teal/10 cursor-pointer"
          onClick={(e) => clickHandler(e)}
        >
          <span>{props.question}</span>
          <span
            className={`feather ml-3 ${
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

      let details = document.getElementById("detailsID" + props.id);

      if (props.open) {
        details!.classList.add("max-h-20");

        setTimeout(() => {
          props.onChange();
        }, 300);
      } else {
        details!.classList.add("min-h-[170px]");
        
        setTimeout(() => {
          props.onChange();
        }, 200);
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
                  id={index}
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
                  id={index + arrParticipants.length}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
