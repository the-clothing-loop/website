import { Dispatch, SetStateAction, useState, MouseEvent } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

interface AccordionFaqTranslation {
  question: string;
  answer: string;
}

export default function FAQ() {
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

      <main className="container mx-auto px-3 md:px-20 pt-10">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 md:pr-5">
            <div className="mb-6">
              <h1 className="font-sans font-semibold text-secondary text-3xl mb-4">
                {t("faqForParticipants")}
              </h1>
              <AccordionFaqs arr={arrParticipants} initialOpen={0} />
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-5">
            <div className="mb-6">
              <h1 className="font-sans font-semibold text-secondary text-3xl mb-4">
                {t("faqForHosts")}
              </h1>
              <AccordionFaqs arr={arrHosts} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function AccordionFaqs(props: {
  arr: AccordionFaqTranslation[];
  initialOpen?: number;
}) {
  const [open, setOpen] = useState(() =>
    props.initialOpen === undefined ? -1 : props.initialOpen
  );
  const [prevActive, setPrevActive] = useState(-1);
  const [nextActive, setNextActive] = useState(-1);

  function handleOpenChange(index: number): () => void {
    return () => {
      if (open === index) {
        setPrevActive(open);
        setTimeout(() => {
          setPrevActive(-1);
          setOpen(-1);
        }, 300);
      } else {
        setNextActive(index);
        setOpen(index);
        setTimeout(() => {
          setNextActive(-1);
        }, 300);
      }
    };
  }

  return (
    <div>
      {props.arr.map((item, index) => (
        <AccordionFaq
          open={open === index}
          prevActive={prevActive === index}
          nextActive={nextActive === index}
          onChange={handleOpenChange(index)}
          key={index}
          item={item}
        />
      ))}
    </div>
  );
}

function AccordionFaq(props: {
  item: AccordionFaqTranslation;
  open: boolean;
  prevActive: boolean;
  nextActive: boolean;
  onChange: () => void;
}) {
  function clickHandler(e: MouseEvent) {
    e.preventDefault();
    props.onChange();
  }

  return (
    <details
      className={`group last-of-type:mb border-none overflow-hidden`}
      open={props.open || props.prevActive}
    >
      <summary
        tabIndex={0}
        className="marker:content-none list-none text-lg font-medium flex justify-between items-center hover:bg-teal/10 group-open:bg-teal/10 cursor-pointer"
        onClick={clickHandler}
      >
        <span className="p-3 w-full">{props.item.question}</span>
        <span
          className={`feather p-3 ${
            props.open && !props.prevActive ? "feather-minus" : "feather-plus"
          }`}
        />
      </summary>
      <div
        className={"transition-colors"
          .concat(props.open ? " bg-teal-light" : "")
          .concat(
            props.prevActive
              ? " animate-[200ms_linear_0ms_max-h_reverse_both]"
              : props.nextActive
              ? " animate-[200ms_linear_0ms_max-h]"
              : ""
          )}
      >
        <p
          className="py-2 px-4 prose"
          dangerouslySetInnerHTML={{ __html: props.item.answer }}
        ></p>
      </div>
    </details>
  );
}
