import { Helmet } from "react-helmet";

import { useState, useContext, useEffect, FormEvent, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ToastContext } from "../providers/ToastProvider";

import { Event } from "../api/types";
import EventsFilterBar from "../components/EventsFilterBar";
import { GenderBadges } from "../components/Badges";
import DistanceDropdown from "../components/DistanceDropdown";
import useForm from "../util/form.hooks";

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
export interface distanceValue {
  distance: string[];
}

interface Props {
  initialValues?: distanceValue;
  onSearch: (search: distanceValue) => void;
}

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";

export default function Events(props: Props) {
  const { t } = useTranslation();

  const { addToastError, addModal, addToast } = useContext(ToastContext);
  const [events, setEvents] = useState<Event[]>();
  const [hover, setHover] = useState(false);
  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();

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
  const [distance, setDistance] = useState<string>();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const urlParams = new URLSearchParams("/events");

    try {
      await eventGetAll({
        latitude: 50.662085,
        longitude: 87.778691,
        radius: 10000,
      }).then((res) => {
        const _events = res.data;
        const todayDate = new Date();

        const filterFunc = createFilterFunc(
          urlParams.getAll("genders"),
          urlParams.getAll("date")
        );
        // add other parameters later
        setAllEvents(_events.filter(filterFunc));
        setEvents(_events.filter(filterFunc));
        setLat(11.802937);
        setLong(82.702957);
      });
    } catch (err: any) {
      console.error(err);
      addToastError(GinParseErrors(t, err), err.status);
    }
  }
  let refSubmit = useRef<any>();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Events</title>
        <meta name="description" content="Upcoming Events" />
      </Helmet>
      <main>
        <div className="max-w-screen-xl min-h-screen mx-auto py-10 px-6 md:px-20">
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-8">
            Upcoming Events
          </h1>
          <form className="flex" onSubmit={handleSubmit}>
            <div
              className="font-sans text-lg md:text-2xl mb-6 cursor-default inline-block hover:opacity-75 hover:underline"
              onClick={handleLocation}
            >
              Events Near {lat}, {long}
            </div>
            <div>
              <DistanceDropdown
                className="w-[150px] md:w-[170px] ml-4 md:ml-8"
                selectedDistance={distance!}
                handleChange={(d) => setDistance(d)}
              />
              <button
                type="submit"
                className="btn btn-primary ml-8"
                ref={refSubmit}
              >
                <span className="hidden sm:inline">{t("search")}</span>
                <span className="sm:hidden inline feather feather-search"></span>
              </button>
            </div>
          </form>
          <EventsFilterBar
            initialValues={{
              genders: urlParams.getAll("genders") || [],
              date: urlParams.getAll("date") || [],
              distance: urlParams.getAll("distance") || [],
            }}
            onSearch={handleSearch}
          />
          {handleEmptyEvents()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events
              ?.sort((a, b) => a.date.localeCompare(b.date))
              .map((event) => {
                const date = new Date(event.date);
                const genders = event.genders;
                var eventURL = window.location.pathname + "/" + event.uid;
                return (
                  <div className="pt-10 px-0" key={event.uid}>
                    <Link to={eventURL}>
                      <div
                        className="bg-teal-light mr-0 md:mr-6 mb-6 max-w-xl overflow-hidden"
                        //onMouseOver={() => setHover(true)}
                        //onMouseLeave={() => setHover(false)}
                      >
                        <div className="container relative overflow-hidden">
                          <div className="bg-teal text-white font-extrabold text-md absolute mt-4 right-4 text-center p-2 z-10">
                            <p>{months[date.getMonth()]}</p>
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
                                hover ? "opacity-60 transition ease-in-out" : ""
                              }`}
                            >
                              {/*Address is an emptry string in the fake data; name for now just for visible reasons*/}
                              {event.address}
                              {"Mission Dolores"}
                            </span>
                            <div className="p-2">
                              {event.genders?.length ? (
                                <>
                                  <div className="mb-2">
                                    {GenderBadges(t, event.genders)}
                                  </div>
                                </>
                              ) : null}
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
      </main>
    </>
  );

  function handleEmptyEvents() {
    if (events?.length == 0) {
      return (
        <div className="max-w-screen-sm mx-auto flex-grow flex flex-col justify-center items-center">
          <h1 className="font-serif text-secondary text-4xl font-bold my-10 text-center">
            Sorry there are no events that match these filters.
          </h1>
          <div className="flex mx-auto">
            <Link to="/" className="btn btn-primary mx-4">
              {t("home")}
            </Link>
            <Link to="/events" className="btn btn-primary mx-4">
              {t("All events")}
            </Link>
          </div>
        </div>
      );
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // props.onSearch(distance);
    console.log(distance);

    switch (distance) {
      case "1":
        handleDistance(lat!, long!, 1);
        break;
      case "2":
        handleDistance(lat!, long!, 5);
        break;
      case "3":
        handleDistance(lat!, long!, 10);
        break;
      case "4":
        console.log("case4");

        handleDistance(lat!, long!, 15);
        break;
      case "5":
        handleDistance(lat!, long!, 6000);
        break;
    }
  }
  function handleDistance(lat: number, lon: number, rad: number) {
    try {
      eventGetAll({
        latitude: lat,
        longitude: lon,
        radius: rad,
      }).then((res) => {
        const _events = res.data;
        setEvents(_events);
        setAllEvents(_events);

      });
    } catch (err: any) {
      console.error(err);
      addToastError(GinParseErrors(t, err), err.status);
    }
  }
  function whenFilterHandler(e: Event, d: string) {
    const todayDate = new Date();
    const today = new Date(todayDate.getTime());
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date(todayDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    tomorrow.setHours(0, 0, 0, 0);

    switch (d) {
      case "1":
        if (eventDate.getTime() < tomorrow.getTime()) {
          return true;
        }
        break;
      case "2":
        if (eventDate.getTime() <= tomorrow.getTime()) return true;

        break;
      case "3":
        const thisWeek = new Date(
          todayDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        thisWeek.setHours(0, 0, 0, 0);

        if (eventDate.getTime() <= thisWeek.getTime()) return true;

        break;
      case "4":
        const nextTwoWeeks = new Date(
          todayDate.getTime() + 14 * 24 * 60 * 60 * 1000
        );
        nextTwoWeeks.setHours(0, 0, 0, 0);

        if (eventDate.getTime() <= nextTwoWeeks.getTime()) return true;

        break;
      case "5":
        const thisMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        thisMonth.setHours(0, 0, 0, 0);

        if (eventDate.getTime() < thisMonth.getTime()) return true;

        break;
    }
  }

  function createFilterFunc(
    genders: string[],
    date: string[]
  ): (e: Event) => boolean {
    let filterFunc = (e: Event) => true;
    if (genders?.length) {
      console.log("events before", events);
      filterFunc = (e) => {
        for (let g of genders) {
          if (e.genders?.includes(g)) return true;
        }
        return false;
      };
    } else if (date?.length) {
      filterFunc = (e) => {
        for (let d of date) {
          if (whenFilterHandler(e, d)) return true;
        }
        return false;
      };
    }
    return filterFunc;
  }

  function handleSearch(search: SearchValues) {
    if (!events) return;

    const selectedEventsFilter = createFilterFunc(search.genders, search.date);
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
    for (const date of search.date) {
      queryParams.append("d", date);
    }
    return "?" + queryParams.toString();
  }

  function handleLocation() {
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
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLong(pos.coords.longitude);

        console.log(`Latitude : ${pos.coords.latitude}`);
        console.log(`Longitude: ${pos.coords.longitude}`);
      },
      (err) => {
        console.error(`Couldn't receive location: ${err.message}`, 400);
      }
    );
  }
}
