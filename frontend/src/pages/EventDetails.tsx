import { Helmet } from "react-helmet";

import { Trans, useTranslation } from "react-i18next";
import { useState, useEffect, useContext } from "react";
import {
  eventGet,
  eventGetAll,
  eventCreate,
  eventUpdate,
  eventDelete,
  eventICalURL,
} from "../api/event";
import { Event, User } from "../api/types";
import { GenderI18nKeys } from "../api/enums";

import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";
import { Link, useLocation, useHistory, Redirect } from "react-router-dom";
import { GenderBadges, SizeBadges } from "../components/Badges";

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";
const CirclesFrame =
  "https://ucarecdn.com/200fe89c-4dc0-4a72-a9b2-c5d4437c91fa/-/format/auto/circles.png";

export default function EventDetails() {
  const { t } = useTranslation();

  const { addToastError, addModal, addToast } = useContext(ToastContext);
  const [event, setEvent] = useState<Event>();
  const months = [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const urlParams = new URLSearchParams("/events");

    try {
      const eventUID = window.location.pathname.split("/").at(-1);
      console.log(eventUID);

      await eventGet(eventUID!).then((res) => {
        const _event = res.data;
        setEvent(_event);
      });
    } catch (err: any) {
      console.error(err);
      addToastError(GinParseErrors(t, err), err.status);
    }
  }

  if (!event) {
    return (
      <div className="max-w-screen-sm mx-auto flex-grow flex flex-col justify-center items-center">
        <h1 className="font-serif text-secondary text-4xl font-bold my-10">
          Event not found
        </h1>
        <div className="flex">
          <Link to="/" className="btn btn-primary mx-4">
            {t("home")}
          </Link>
          <Link to="/events" className="btn btn-primary mx-4">
            {t("events")}
          </Link>
        </div>
      </div>
    );
  } else {
    const date = new Date(event.date);
    const genders = event.genders;
    const icalURL = eventICalURL(event.uid);
    console.log(icalURL);
    return (
      <>
        <Helmet>
          <title>The Clothing Loop | Event Details</title>
          <meta name="description" content="Event Details" />
        </Helmet>
        <main>
          <div className="bg-teal-light h-1/3 w-full overflow-visible absolute -z-10" />
          {event ? (
            <div className="max-w-screen-xl mx-auto pt-10 px-6 md:px-20">
              <a href={icalURL}>
                <button
                  className="btn btn-primary inline w-fit float-right mt-16"
                  onClick={(e) => subscribeHandler()}
                >
                  <span className="pr-2 feather feather-calendar" />
                  Add event to your calendar
                </button>
              </a>
              <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-16 px-0">
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
                        {days[date.getDay()]}, {date.getDate()}{" "}
                        {months[date.getMonth()]} {date.getFullYear()} at{" "}
                        {date.getHours()}:{date.getMinutes()}
                      </span>
                    </div>
                    <div className="px-10 py-4 font-bold font-sans text-xl text-teal">
                      Location:
                    </div>
                    <div className="px-8 lg:px-16">
                      <span className="pr-2 feather feather-map-pin"></span>
                      <span className="font-sans text-lg">
                        {event.address} Mission Dolores Park
                      </span>
                    </div>
                    <div className="px-10 py-4 font-bold font-sans text-xl text-teal">
                      Categories:
                    </div>

                    <div className="flex flex-col w-full text-sm px-8 lg:px-16">
                      {event.genders?.length ? (
                        <>
                          <div className="mb-2">
                            {GenderBadges(t, event.genders)}
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div className="px-10 py-4 font-bold font-sans text-xl text-teal">
                      Contact:
                    </div>
                    <div className="px-8 lg:px-16">
                      <span className="pr-2 feather feather-mail"></span>
                      <span className="font-sans text-lg break-all">
                        fakejohnsmith@gmail.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:py-16 mb-4 w-full md:w-2/3">
                  <h2 className="font-serif font-bold text-secondary text-2xl mb-8 px-0">
                    Event Details
                  </h2>
                  {event.description}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </>
    );
  }

  function subscribeHandler() {}
}
