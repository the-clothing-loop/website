import { Helmet } from "react-helmet";

import { useState, useContext, useEffect, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Event } from "../api/types";
import { eventGetAll } from "../api/event";
import CategoriesDropdown from "../components/CategoriesDropdown";
import { GenderBadges } from "../components/Badges";
import DistanceDropdown from "../components/DistanceDropdown";
import useForm from "../util/form.hooks";
import { GinParseErrors } from "../util/gin-errors";
import { ToastContext } from "../providers/ToastProvider";
import dayjs from "../util/dayjs";
//import LocationModal from "../components/LocationModal";
import LocationValues from "../components/LocationModal";
import LocationModal from "../components/LocationModal";
interface SearchValues {
  genders: string[];
  latitude: number;
  longitude: number;
  distance: number;
}

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";

const MAX_DISTANCE = 5000;
const DEFAULT_LATITUDE = 52.377956;
const DEFAULT_LONGITUDE = 4.89707;
//console.log(LocationValues)
export default function Events() {
  const { t } = useTranslation();

  const { addToastError, addModal } = useContext(ToastContext);
  const [events, setEvents] = useState<Event[] | null>(null);
  const [values, setValue] = useForm<SearchValues>({
    genders: [] as string[],
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    distance: -1,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams("/events");

    load(
      urlParams.getAll("g"),
      DEFAULT_LATITUDE,
      DEFAULT_LONGITUDE,
      MAX_DISTANCE
    );
  }, []);

  async function load(
    filterGenders: string[],
    latitude: number,
    longitude: number,
    _distance: number
  ) {
    const radius = _distance === -1 ? MAX_DISTANCE : _distance;
    // This radius is temporarily set very high because of how dispersed the fake data locations are
    try {
      await eventGetAll({ latitude, longitude, radius }).then((res) => {
        const filterFunc = createFilterFunc(filterGenders);
        setEvents(res.data?.filter(filterFunc));
      });
    } catch (err: any) {
      addToastError(GinParseErrors(t, err), err.status);
    }
  }

  function submitDistance(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return load(
      values.genders,
      values.latitude,
      values.longitude,
      values.distance
    );
  }

  function handleOpenModalGetLocation() {
    addModal({
      message: "Select your location",
      actions: [
        {
          text: "Submit-test",
          type: "location",
          fn: () => {
            console.log("in fn");
            return(
              <LocationModal/>
            );
          },
        },
      ],
    });
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
            onSubmit={submitDistance}
          >
            <div
              className="font-sans text-lg md:text-2xl my-auto md:mr-6 cursor-pointer hover:opacity-75 hover:underline"
              onClick={handleOpenModalGetLocation}
            >
              {t("eventsNear")}
            </div>
            <DistanceDropdown
              className="w-[150px] md:w-[190px] py-2 md:py-0 md:mr-8"
              selectedDistance={values.distance!}
              handleChange={(d) => setValue("distance", d)}
            />
            <button type="submit" className="btn btn-primary">
              <span className="hidden sm:inline">{t("search")}</span>
              <span className="sm:hidden inline feather feather-search"></span>
            </button>
          </form>
          <div className="flex flex-col md:flex-row pb-8">
            <CategoriesDropdown
              className="w-[150px] md:w-[170px] mr-4 md:mr-8 py-4 pb-2 md:py-0"
              selectedGenders={values.genders}
              handleChange={(gs) => {
                setValue("genders", gs);
                load(gs, values.latitude, values.longitude, values.distance);
              }}
            />
          </div>

          {!events ? (
            <div
              className="max-w-screen-sm mx-auto flex-grow flex flex-col justify-center items-center"
              key="noevent"
            >
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
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              key="event"
            >
              {events
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((event) => {
                  const date = dayjs(event.date);
                  const eventURL = window.location.pathname + "/" + event.uid;
                  return (
                    <div className="h-full" key={event.uid}>
                      <Link to={eventURL}>
                        <div className="bg-teal-light h-full max-w-xl overflow-hidden">
                          <div className="container relative overflow-hidden">
                            <div className="bg-teal text-white text-md absolute mt-4 right-4 text-center py-2 px-3 z-10">
                              <p>
                                <span className="inline-block pr-1 font-extrabold">
                                  {date.format("MMMM")}
                                </span>
                                <span>{" " + date.format("D")}</span>
                              </p>
                            </div>
                            <img src={ClothesImage} className="w-full h-auto" />
                          </div>
                          <div className="text-lg">
                            <div className="mt-4 pb-2 pl-4 text-xl text-teal font-bold">
                              {event.name}
                            </div>
                            <div className="px-4 mb-2 pb-2">
                              <span className="feather feather-map-pin"></span>

                              <span className="text-md px-2">
                                {event.address}
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
          )}
        </div>
      </main>
    </>
  );
}

function createFilterFunc(genders: string[]): (e: Event) => boolean {
  return (e: Event) => {
    if (genders.length) {
      let found = false;
      for (let g of genders) {
        if (e.genders?.includes(g)) found = true;
      }
      if (!found) return false;
    }
    return true;
  };
}

// write params to browser url location
function writeUrlSearchParams(search: SearchValues) {
  const queryParams = new URLSearchParams();
  for (const gender of search.genders) {
    queryParams.append("g", gender);
  }
  const params = "?" + queryParams.toString();

  window.history.replaceState(
    {},
    "",
    window.location.origin + window.location.pathname + params
  );
}
