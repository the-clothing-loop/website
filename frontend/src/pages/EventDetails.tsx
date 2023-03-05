import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { useState } from "react";

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";
const CirclesFrame =
  "https://ucarecdn.com/200fe89c-4dc0-4a72-a9b2-c5d4437c91fa/-/format/auto/circles.png";




  


export default function EventDetails() {
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Event Details</title>
        <meta name="description" content="Event Details" />
      </Helmet>
      <main>
        <div className="bg-teal-light h-1/3 w-full overflow-visible absolute -z-10" />
        <div className="max-w-screen-xl mx-auto pt-10 px-6 md:px-20">
          {" "}
          <button className="btn btn-primary inline w-fit float-right mt-16"
          onClick={(e) => subscribeHandler()}>
            <span className="pr-2 feather feather-calendar" />
            Add event to your calendar
          </button>
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-16 px-0">
            {/*calendar.name*/}
            {"Mission Dolores Swapping Party"}
          </h1>
          <div className="md:mx-0 px-0">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="relative flex">
                <img
                  src={ClothesImage}
                  alt=""
                  className="max-w-full md:max-w-2/3 h-auto object-contain object-center my-auto md:col-span-2"
                />
                <img
                  className="-z-10 absolute -right-4 md:-right-16 -top-10 overflow-hidden"
                  src={CirclesFrame}
                  aria-hidden
                  alt=""
                />
                <img
                  className="max-sm:hidden -z-10 absolute -left-16 -bottom-8"
                  aria-hidden
                  alt=""
                  src={CirclesFrame}
                />
              </div>
              <div className="shadow-[2px_3px_3px_1px_rgba(66,66,66,0.2)] w-full md:w-1/3 my-8 md:my-auto bg-white py-12 ml-0 md:ml-12 lg:ml-20">
                <div className="px-10 py-2 font-bold font-sans text-xl text-teal">
                  Time:
                </div>
                <div className="px-8 lg:px-16">
                  <span className="pr-2 feather feather-clock"></span>
                  <span className="font-sans text-lg">
                    {/*calendar.date*/} March 3rd, 2023 1pm - 3pm
                  </span>
                </div>
                <div className="px-10 py-4 font-bold font-sans text-xl text-teal">
                  Location:
                </div>
                <div className="px-8 lg:px-16">
                  <span className="pr-2 feather feather-map-pin"></span>
                  <span className="font-sans text-lg">
                    {/*calendar.location*/} Mission Dolores Park
                  </span>
                </div>
                <div className="px-10 py-4 font-bold font-sans text-xl text-teal">
                  Categories:
                </div>
                <div className="px-8 lg:px-16">
                  {/*calendar.categories*/}
                  <span className="badge badge-outline bg-teal-light mr-2">
                    Women's
                  </span>
                  <span className="badge badge-outline bg-teal-light mr-2">
                    Men's
                  </span>
                </div>
                <div className="px-10 py-4 font-bold font-sans text-xl text-teal">
                  Contact:
                </div>
                <div className="px-8 lg:px-16">
                  <span className="pr-2 feather feather-mail"></span>
                  <span className="font-sans text-lg break-all">
                    {/*uid.email*/} fakejohnsmith@gmail.com
                  </span>
                </div>
              </div>
            </div>

            <div className="md:py-16 mb-4 w-full md:w-2/3">
              <h2 className="font-serif font-bold text-secondary text-2xl mb-8 px-0">
                Event Details
              </h2>
              {/*calendar.description*/}
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Vulputate ut pharetra sit amet aliquam id diam maecenas
                ultricies. Libero nunc consequat interdum varius sit amet mattis
                vulputate enim. Interdum consectetur libero id faucibus nisl
                tincidunt eget nullam. Suspendisse faucibus interdum posuere
                lorem ipsum dolor. Feugiat scelerisque varius morbi enim. Et
                malesuada fames ac turpis egestas maecenas pharetra convallis
                posuere. Et malesuada fames ac turpis egestas maecenas. In est
                ante in nibh mauris cursus mattis molestie a. Sit amet facilisis
                magna etiam. Volutpat commodo sed egestas egestas fringilla
                phasellus faucibus scelerisque eleifend. Rhoncus dolor purus non
                enim praesent elementum facilisis leo vel.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );

  function subscribeHandler(){

  }
}
