import { Helmet } from "react-helmet";

import { useState, useContext, useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useLocation, useHistory } from "react-router-dom";
import { ToastContext } from "../providers/ToastProvider";

import { Event } from "../api/types";
import { GenderI18nKeys } from "../api/enums";
import EventsFilterBar from "../components/EventsFilterBar";

import {
  eventGet,
  eventGetAll,
  eventCreate,
  eventUpdate,
  eventDelete,
  eventICalURL,
} from "../api/event";
import { GinParseErrors } from "../util/gin-errors";

export interface SearchValues {
  genders: string[];
  date: string[];
  distance: string[];
}

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";

export default function Events() {
  const { t } = useTranslation();

  const [locationLoading, setLocationLoading] = useState(false); // I think this is primarily for styling
  const { addToastError, addModal, addToast } = useContext(ToastContext);
  const [events, setEvents] = useState<Event[]>();
  const [hover, setHover] = useState(false);
  const [longLat, setLongLat] = useState<GeoJSON.Position>();
  const urlParams = new URLSearchParams(location.search);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
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

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const urlParams = new URLSearchParams("/events");

    try {
      await eventGetAll({
        latitude: 69.880514,
        longitude: 98.599997,
        radius: 10000,
      }).then((res) => {
        const _events = res.data;

        const filterFunc = createFilterFunc(
          urlParams.getAll("genders")
          // urlParams.getAll("address"),
          // urlParams.getAll("date")
        );
        // add other parameters later
        setAllEvents(_events.filter(filterFunc));
        setEvents(_events.filter(filterFunc));
      });
    } catch (err: any) {
      console.error(err);
      addToastError(GinParseErrors(t, err), err.status);
    }
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Events</title>
        <meta name="description" content="Upcoming Events" />
      </Helmet>
      <main>
        <div className="max-w-screen-xl mx-auto pt-10 px-6 md:px-20 overflow-hidden">
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-8">
            Upcoming Events
          </h1>
          <div>
            <div
              className="font-sans text-lg md:text-2xl mb-6 cursor-default inline-block hover:opacity-75 hover:underline"
              onClick={handleLocation}
            >
              Events Near San Francisco
            </div>

            <EventsFilterBar
              initialValues={{
                genders: urlParams.getAll("genders") || [],
                date: urlParams.getAll("date") || [],
                distance: urlParams.getAll("distance") || [],
              }}
              onSearch={handleSearch}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {events
                ?.sort((a, b) => a.date.localeCompare(b.date))
                .map((event) => {
                  const date = new Date(event.date);
                  const genders = event.genders;
                  var eventURL = window.location.pathname + "/" + event.uid;

                  return (
                    <div className="pb-10 px-0" key={event.uid}>
                      <Link to={eventURL}>
                        <div
                          className="bg-teal-light mr-0 md:mr-6 mb-6 max-w-xl overflow-hidden"
                          //onMouseOver={() => setHover(true)}
                          //onMouseLeave={() => setHover(false)}
                        >
                          <div className="container relative overflow-hidden">
                            <div className="bg-teal text-white font-extrabold text-md absolute mt-4 right-4 text-center p-2 z-10">
                              <p>{months[date.getMonth()]}</p>{" "}
                              <p className="font-light">{date.getDate()}</p>
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
                                hover
                                  ? "text-opacity-80 transition ease-in-out"
                                  : ""
                              }`}
                            >
                              {event.name}
                            </div>
                            <div className="px-4 mb-2 pb-2">
                              <span
                                className={`feather feather-map-pin ${
                                  hover
                                    ? "feather feather-map-pin opacity-60 transition ease-in-out"
                                    : ""
                                }`}
                              ></span>

                              <span
                                className={`text-md px-2 ${
                                  hover
                                    ? "opacity-60 transition ease-in-out"
                                    : ""
                                }`}
                              >
                                {/*Address is an emptry string in the fake data; name for now just for visible reasons*/}
                                {event.address}
                                {"Mission Dolores"}
                              </span>
                              <div className="p-2">
                                {genders?.map((g) => {
                                  return (
                                    <span
                                      className="badge badge-outline bg-teal-light mr-4"
                                      key={g}
                                    >
                                      {t(GenderI18nKeys[parseInt(g)])}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>
    </>
  );

  function createFilterFunc(genders: string[]): (e: Event) => boolean {
    let filterFunc = (e: Event) => true;

    if (genders?.length) {
      filterFunc = (c) => {
        for (let g of genders) {
          if (c.genders?.includes(g)) return true;
        }
        return false;
      };
    }
    return filterFunc;
  }

  function handleSearch(search: SearchValues) {
    if (!events) return;

    const selectedEventsFilter = createFilterFunc(search.genders);
    const filteredEvents = allEvents.filter(selectedEventsFilter);

    setEvents(filteredEvents);

    window.history.replaceState(
      {},
      "",
      window.location.origin +
        window.location.pathname +
        toUrlSearchParams(search)
    );
  }

  function toUrlSearchParams(search: SearchValues) {
    const queryParams = new URLSearchParams();

    for (const gender of search.genders) {
      queryParams.append("g", gender);
    }
    return "?" + queryParams.toString();
  }

  function handleLocation() {
    // pop up and asks to either type in the location or ask permission to use location from browser
    // if user clicks use my location enter getLocationBrowser()
    //e.preventDefault();
    addModal({
      message: "Enter your location or allow browser to see location",
      actions: [
        {
          text: "Allow browser access",
          type: "secondary",
          fn: () => {
            getLocationBrowser();
          },
        },
      ],
    });
  }

  function getLocationBrowser() {
    setLocationLoading(true);
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(`Latitude : ${pos.coords.latitude}`);
        console.log(`Longitude: ${pos.coords.longitude}`);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        console.error(`Couldn't receive location: ${err.message}`, 400);
      }
    );
  }
}
