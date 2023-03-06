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
      o === CarouselOperation.PLUS
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
    <section className="text-secondary mb-10 max-w-screen-lg mx-auto">
      <div className="container mx-auto px-6 flex justify-between">
        <h2 className="font-serif font-bold text-4xl md:text-6xl">
          {t("testimonials")}
        </h2>
        <div className="hidden sm:flex items-center">
          <button
            className="btn btn-circle btn-secondary opacity-70"
            onClick={() => click(CarouselOperation.MINUS)}
          >
            <span className="sr-only">next right</span>
            <span className="feather feather-arrow-left" />
          </button>
          <button
            className="btn btn-circle btn-secondary opacity-70 ml-4"
            onClick={() => click(CarouselOperation.PLUS)}
          >
            <span className="sr-only">next left</span>
            <span className="feather feather-arrow-right" />
          </button>
        </div>
      </div>

      <div className="carousel mt-6" id="home-carousel">
        {testimonials.map((testimonial, i) => {
          return (
            <div className="carousel-item p-4 w-72 flex flex-col" key={i}>
              <div className="relative p-4 pt-12 bg-teal/10">
                <span className="absolute top-[-6.5rem] left-0 font-serif text-[13rem] text-teal/30 -z-10 select-none">
                  &#x201C;
                </span>
                <blockquote className="text-lg text-base-content">
                  {testimonial.message}
                </blockquote>
                <p className="font-bold mt-3">- {testimonial.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
