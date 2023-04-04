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
import { AuthContext } from "../providers/AuthProvider";
import dayjs from "../util/dayjs";

interface SearchValues {
  genders: string[];
  latitude: number;
  longitude: number;
  distance: number;
}

// Media
const ClothesImage =
  "https://images.clothingloop.org/768x/nichon_zelfportret.jpg";

const MAX_RADIUS = 5000;
const DEFAULT_LATITUDE = 52.377956;
const DEFAULT_LONGITUDE = 4.89707;

export default function Events() {
  const { t } = useTranslation();

  const { addToastError, addModal } = useContext(ToastContext);
  const authUser = useContext(AuthContext).authUser;
  const [events, setEvents] = useState<Event[] | null>(null);
  const [values, setValue] = useForm<SearchValues>(() => {
    const urlParams = new URLSearchParams("/events");
    let latitude =
      Number.parseFloat(urlParams.get("lat") || "") || DEFAULT_LATITUDE;
    let longitude =
      Number.parseFloat(urlParams.get("long") || "") || DEFAULT_LONGITUDE;
    let distance = Number.parseInt(urlParams.get("d") || "") || -1;

    console.log({
      genders: urlParams.getAll("g"),
      latitude,
      longitude,
      distance,
    });

    return {
      genders: urlParams.getAll("g"),
      latitude,
      longitude,
      distance,
    };
  });

  useEffect(() => {
    load(values.genders, values.latitude, values.longitude, values.distance);
  }, []);

  async function load(
    filterGenders: string[],
    latitude: number,
    longitude: number,
    distance: number
  ) {
    const radius = distance === -1 ? MAX_RADIUS : distance;
    writeUrlSearchParams({
      genders: filterGenders,
      latitude,
      longitude,
      distance,
    });
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
      message: t("allowLocation"),
      actions: [
        {
          text: t("allow"),
          type: "secondary",
          fn: () => {
            window.navigator.geolocation.getCurrentPosition(
              (pos) => {
                setValue("latitude", pos.coords.latitude);
                setValue("longitude", pos.coords.longitude);

                console.log(`Latitude : ${pos.coords.latitude}`);
                console.log(`Longitude: ${pos.coords.longitude}`);
              },
              (err) => {
                console.warn(`Couldn't receive location: ${err.message}`);
              }
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

          <div className="flex flex-col-reverse md:flex-row justify-start md:justify-between">
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
            {authUser ? (
              <Link
                to="/create-event"
                className="btn btn-primary flex w-fit md:mb-0 md:float-right"
              >
                <span className="pr-2 feather feather-plus" />
                Create Event
              </Link>
            ) : null}
          </div>
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
                .map((event) => (
                  <EventItem event={event} key={event.uid} />
                ))}
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
  if (search.distance && search.latitude && search.longitude) {
    queryParams.append("d", search.distance + "");
    queryParams.append("lat", search.latitude + "");
    queryParams.append("long", search.longitude + "");
  }
  const params = "?" + queryParams.toString();

  window.history.replaceState(
    {},
    "",
    window.location.origin + window.location.pathname + params
  );
}

function EventItem({ event }: { event: Event }) {
  const { t, i18n } = useTranslation();

  const date = dayjs(event.date);
  const eventURL = window.location.pathname + "/" + event.uid;
  return (
    <article className="flex flex-col bg-teal-light">
      <Link to={eventURL} className="relative aspect-[4/3]">
        <div className="bg-teal text-white text-md absolute mt-4 right-4 text-center py-2 px-3 z-10">
          <p>
            <span className="inline-block pr-1 font-extrabold">
              {date.format("MMMM")}
            </span>
            <span>{" " + date.format("D")}</span>
          </p>
        </div>
        <img src={ClothesImage} className="w-full h-full object-cover" />
      </Link>

      <div className="flex-grow m-4">
        <h2 className="text-xl text-teal font-bold">
          <Link to={eventURL}>{event.name}</Link>
        </h2>
      </div>
      <dl className="m-4 mt-0">
        <dd className="mb-2" key={"address" + event.uid}>
          <span className="feather feather-map-pin mr-2 rtl:mr-0 rtl:ml-2"></span>

          <address className="inline">{event.address}</address>
        </dd>
        <dd>{event.genders?.length ? GenderBadges(t, event.genders) : null}</dd>
      </dl>
    </article>
  );
}
