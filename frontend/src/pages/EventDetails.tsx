import { Helmet } from "react-helmet";

import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { eventGetAll, eventICalURL } from "../api/event";
import { Event } from "../api/types";
import simplifyDays from "../util/simplify-days";
import { GenderBadges } from "../components/Badges";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";
import dayjs from "dayjs";
import dayjs_calendar_plugin from "dayjs/plugin/calendar";
import useToClipboard from "../util/to-clipboard.hooks";

dayjs.extend(dayjs_calendar_plugin);

// Media
const ClothesImage =
  "https://images.clothingloop.org/768x/nichon_zelfportret.jpg";
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";

export default function EventDetails() {
  const { t, i18n } = useTranslation();
  const { addToastError } = useContext(ToastContext);
  const [event, setEvent] = useState<Event>();
  const [, , , addCopyAttributes] = useToClipboard();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const eventUID = window.location.pathname.split("/").at(-1);

      await eventGetAll({
        latitude: 50.662085,
        longitude: 87.778691,
        radius: 30000,
      }).then((res) => {
        const _event = res.data;
        _event.forEach((e) => {
          if (e.uid == eventUID) setEvent(e);
        });
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
          {t("eventNotFound")}
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
    const icalURL = eventICalURL(event.uid);
    const icalFilename = `${event.name}.ics`;

    return (
      <>
        <Helmet>
          <title>The Clothing Loop | Event Details</title>
          <meta name="description" content="Event Details" />
        </Helmet>
        <main>
          <div className="bg-teal-light h-1/3 w-full overflow-visible absolute -z-10" />
          <div className="max-w-screen-xl mx-auto pt-10 px-6 md:px-20">
            <a href={icalURL} download={icalFilename}>
              <button className="btn btn-primary inline w-fit float-right mt-16">
                <span className="pr-2 feather feather-calendar" />
                {t("addToCalendar")}
              </button>
            </a>
            <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-16 px-0">
              {event.name}
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
                <dl className="shadow-[2px_3px_3px_1px_rgba(66,66,66,0.2)] w-full md:w-1/3 my-8 md:my-auto bg-white py-10 px-8 ml-0 md:ml-12 lg:ml-20">
                  <dt className="mb-2 font-bold font-sans text-xl text-teal">
                    {t("time") + ":"}
                  </dt>
                  <dd className="mb-1 ml-4">
                    <span className="pr-2 feather feather-clock"></span>
                    <span className="font-sans text-lg">
                      {simplifyDays(t, i18n, event.date)}
                    </span>
                  </dd>
                  {event.address ? (
                    <>
                      <dt className="mb-2 font-bold font-sans text-xl text-teal">
                        {t("location") + ":"}
                      </dt>
                      <dd className="mb-1 ml-4">
                        <span
                          className="mr-2 feather feather-map-pin"
                          aria-hidden
                        ></span>
                        <address
                          {...addCopyAttributes(
                            t,
                            event.address,
                            "text-lg inline"
                          )}
                        >
                          {event.address}
                        </address>
                      </dd>
                    </>
                  ) : null}
                  <dt className="mb-2 font-bold font-sans text-xl text-teal">
                    {t("categories") + ":"}
                  </dt>

                  <dd className="mb-1 ml-4 block">
                    {event.genders?.length
                      ? GenderBadges(t, event.genders)
                      : null}
                  </dd>
                  <dt className="mb-2 font-bold font-sans text-xl text-teal">
                    {t("contactHost") + ":"}
                  </dt>
                  <dd className="mr-2 mb-1 ml-4">
                    <div>
                      <span
                        className="mr-2 feather feather-mail"
                        aria-hidden
                      ></span>
                      <span
                        {...addCopyAttributes(
                          t,
                          event.user_email,
                          "text-lg inline break-all"
                        )}
                      >
                        {event.user_email}
                      </span>
                    </div>
                    <div>
                      <span
                        className="mr-2 feather feather-phone"
                        aria-hidden
                      ></span>
                      <span
                        {...addCopyAttributes(
                          t,
                          event.user_phone,
                          "text-lg inline break-all"
                        )}
                      >
                        {event.user_phone}
                      </span>
                    </div>
                  </dd>
                  <dd className="mb-1 ml-4"></dd>
                </dl>
              </div>

              <div className="md:py-16 mb-4 w-full md:w-2/3">
                <h2 className="font-sans font-bold text-secondary text-2xl mb-8 px-0">
                  {t("eventDetails") + ":"}
                </h2>
                {event.description}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
}
