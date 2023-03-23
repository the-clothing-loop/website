import { Helmet } from "react-helmet";

import {
  useState,
  useContext,
  useEffect,
  FormEvent,
  useRef,
  MouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Event } from "../api/types";
import { eventGetAll } from "../api/event";
import { MonthsI18nKeys } from "../api/enums";
import CategoriesDropdown from "../components/CategoriesDropdown";
import WhenDropdown from "../components/WhenDropdown";
import { GenderBadges } from "../components/Badges";
import DistanceDropdown from "../components/DistanceDropdown";
import useForm from "../util/form.hooks";
import { GinParseErrors } from "../util/gin-errors";
import { ToastContext } from "../providers/ToastProvider";

interface SearchValues {
  genders: string[];
  date: string;
}

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";

export default function Events() {
  const { t } = useTranslation();

  const { addToastError, addModal, addToast } = useContext(ToastContext);
  const [events, setEvents] = useState<Event[]>();
  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();

  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const [values, setValue] = useForm<SearchValues>({
    genders: [] as string[],
    date: "" as string,
  });

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

        const filterFunc = createFilterFunc(
          urlParams.getAll("genders"),
          urlParams.get("date")
        );
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

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Events</title>
        <meta name="description" content="Upcoming Events" />
      </Helmet>
      <main>
        <div className="max-w-screen-xl min-h-screen mx-auto py-10 px-6 md:px-20">
          <h1 className="font-serif font-bold text-secondary text-4xl md:text-6xl mb-8">
            {t("upcomingEvents")}
          </h1>
          <form
            className="flex flex-col md:flex-row pb-4 md:pb-8"
            onSubmit={handleSubmitDistance}
          >
            <div
              className="font-sans text-lg md:text-2xl my-auto md:mr-6 cursor-pointer hover:opacity-75 hover:underline"
              onClick={handleLocation}
            >
              {t("eventsNear")} {lat} {long}
            </div>
            <DistanceDropdown
              className="w-[150px] md:w-[190px] py-2 md:py-0 md:mr-8"
              selectedDistance={distance!}
              handleChange={(d) => setDistance(d)}
            />
            <button type="submit" className="btn btn-primary">
              <span className="hidden sm:inline">{t("search")}</span>
              <span className="sm:hidden inline feather feather-search"></span>
            </button>
          </form>
          <form
            className="flex flex-col md:flex-row pb-8"
            onSubmit={handleSubmitValues}
          >
            <div>
              <CategoriesDropdown
                className="w-[150px] md:w-[170px] mr-4 md:mr-8 py-4 pb-2 md:py-0"
                selectedGenders={values.genders}
                handleChange={(gs) => setValue("genders", gs)}
              />
              <WhenDropdown
                className="w-[150px] md:w-[170px] mr-4 md:mr-8 pb-2 md:py-0"
                selectedDate={values.date}
                handleChange={(date) => setValue("date", date)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              <span className="hidden sm:inline">{t("search")}</span>
              <span className="sm:hidden inline feather feather-search"></span>
            </button>
          </form>
          {handleEmptyEvents()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events
              ?.sort((a, b) => a.date.localeCompare(b.date))
              .map((event) => {
                const date = new Date(event.date);
                var eventURL = window.location.pathname + "/" + event.uid;
                return (
                  <div className="h-full" key={event.uid}>
                    <Link to={eventURL}>
                      <div className="bg-teal-light h-full max-w-xl overflow-hidden">
                        <div className="container relative overflow-hidden">
                          <div className="bg-teal text-white font-extrabold text-md absolute mt-4 right-4 text-center p-2 z-10">
                            <p>{t(MonthsI18nKeys[date.getMonth()])}</p>
                            <p className="font-light">{date.getDate()}</p>
                          </div>
                          <img src={ClothesImage} className={"w-full h-auto"} />
                        </div>
                        <div className="text-lg">
                          <div
                            className={
                              "mt-4 pb-2 pl-4 text-xl text-teal font-bold"
                            }
                          >
                            {event.name}
                          </div>
                          <div className="px-4 mb-2 pb-2">
                            <span className={"feather feather-map-pin"}></span>

                            <span className={"text-md px-2"}>
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
            {t("sorryNoEvents")}
          </h1>
          <div className="flex mx-auto">
            <Link to="/" className="btn btn-primary mx-4">
              {t("home")}
            </Link>
            <Link to="/events" className="btn btn-primary mx-4">
              {t("allEvents")}
            </Link>
          </div>
        </div>
      );
    }
  }

  function handleSubmitDistance(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
        handleDistance(lat!, long!, 15);
        break;
      case "5":
        handleDistance(lat!, long!, 20);
        break;
      case "6":
        handleDistance(lat!, long!, 30000);
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

  function createFilterFunc(
    genders: string[],
    date: string | null
  ): (e: Event) => boolean {
    let filterFunc = (e: Event) => true;
    if (genders?.length) {
      filterFunc = (e) => {
        for (let g of genders) {
          if (e.genders?.includes(g)) return true;
        }
        return false;
      };
    } else if (date) {
      filterFunc = (e) => {
        console.log(date);
        if (whenFilterHandler(e, date)) return true;
        return false;
      };
    }
    return filterFunc;
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

      case "6":
        return true;
    }
  }
  function handleSubmitValues(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!events) return;

    const search = values;
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
      message: t("allowLocation"),
      actions: [
        {
          text: t("allow"),
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
