import { useTranslation } from "react-i18next";

interface Testimonial {
  name: string;
  message: string;
}

enum CarouselOperation {
  PLUS,
  MINUS,
}

const slideSize = 400;

export default function Testimonials() {
  const { t } = useTranslation("testimonials");

  let testimonials: Testimonial[] =
    t("arrTestimonials", { defaultValue: [], returnObjects: true }) || [];

  function click(o: CarouselOperation) {
    let e = document.getElementById("home-carousel");
    if (!e) return;

    let maxScroll = e.scrollWidth - e.getBoundingClientRect().width;
    let scrollLeft = e.scrollLeft;

    let scroll =
      o == CarouselOperation.PLUS
        ? scrollLeft + slideSize
        : scrollLeft - slideSize;

    switch (o) {
      case CarouselOperation.PLUS:
        if (scroll > maxScroll + slideSize - 3) {
          scroll = 0;
        }
        break;
      case CarouselOperation.MINUS:
        if (scroll + slideSize - 3 < 0) {
          scroll = maxScroll;
        }
        break;
    }

    console.log(scroll, maxScroll, scrollLeft);

    document.getElementById("home-carousel")?.scroll({
      top: 0,
      left: scroll,
      behavior: "smooth",
    });
  }

  return (
    <section className="tw-text-secondary tw-mb-10">
      <div className="tw-container tw-mx-auto tw-px-1 md:tw-px-20 tw-flex tw-justify-between">
        <h2 className="tw-font-serif tw-font-bold tw-text-6xl">
          {t("testimonials")}
        </h2>
        <div className="tw-flex tw-items-center">
          <button
            className="tw-btn tw-btn-circle tw-btn-secondary tw-opacity-70"
            onClick={() => click(CarouselOperation.MINUS)}
          >
            <span className="feather feather-arrow-left" />
          </button>
          <button
            className="tw-btn tw-btn-circle tw-btn-secondary tw-opacity-70 tw-ml-4"
            onClick={() => click(CarouselOperation.PLUS)}
          >
            <span className="feather feather-arrow-right" />
          </button>
        </div>
      </div>

      <div className="tw-carousel tw-mt-6" id="home-carousel">
        {testimonials.map((testimonial, i) => {
          return (
            <div
              className="tw-carousel-item tw-p-4 tw-w-72 tw-flex tw-flex-col"
              key={i}
            >
              <div className="tw-relative tw-p-4 tw-pt-12 tw-bg-teal/10">
                <span className="tw-absolute tw-top-[-6.5rem] tw-left-0 tw-font-serif tw-text-[13rem] tw-text-teal/30 -tw-z-10 tw-select-none">
                  &#x201C;
                </span>
                <blockquote className="tw-text-lg tw-text-base-content">
                  {testimonial.message}
                </blockquote>
                <p className="tw-font-bold tw-mt-3">- {testimonial.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
