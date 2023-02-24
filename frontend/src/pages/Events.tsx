import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { useState } from "react";

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";

export default function Events() {
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Events</title>
        <meta name="description" content="Upcoming Events" />
      </Helmet>
      <main>
        <div className="max-w-screen-xl mx-auto pt-10 px-0 md:px-20">
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-8 px-6">
            Upcoming Events
          </h1>
          <div className="px-12">
            <div className="font-serif text-lg md:text-xl mb-6 cursor-default hover:opacity-75">
              Events Near SF
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <EventItem />
              <EventItem />
              <EventItem />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function EventItem() {
  const { t } = useTranslation();
  const [hover, setHover] = useState(false);

  return (
    <div className="pb-10 px-0">
      <div
        className="bg-teal-light mr-6 mb-6 max-w-xl overflow-hidden"
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="container relative overflow-hidden">
          <div className="bg-teal text-white font-extrabold text-md absolute mt-4 right-4 text-center p-2 z-10">
            {/*calendar.date*/}
            <p>March</p> <p className="font-light">3</p>
          </div>
          <img
            src={ClothesImage}
            alt=""
            className={`w-full h-auto ${
              hover
                ? "transition ease-in-out duration-300 scale-[1.03]"
                : "transition ease-in-out duration-300 scale-1"
            }`}
          />
        </div>
        <div className="text-lg">
          <div
            className={`mt-4 pb-2 pl-4 text-xl text-teal font-bold ${
              hover ? "text-opacity-80 transition ease-in-out" : ""
            }`}
          >
            {/*calendar.name*/}
            {"Mission Dolores"}
          </div>
          <div className="px-4 mb-2 pb-2">
            <span
              className={`feather feather-map-pin ${
                hover
                  ? "feather feather-map-pin opacity-60 transition ease-in-out"
                  : ""
              }`}
            >
              {" "}
            </span>

            <span
              className={`text-md ${
                hover ? "opacity-60 transition ease-in-out" : ""
              }`}
            >
              {/*calendar.location*/}
              {"Mission Dolores Park"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
