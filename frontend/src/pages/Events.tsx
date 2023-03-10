import { Helmet } from "react-helmet";

import { useState, useContext, useEffect, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ToastContext } from "../providers/ToastProvider";
import { AuthContext } from "../providers/AuthProvider";

import CategoriesDropdown from "../components/CategoriesDropdown";
import SizesDropdown from "../components/SizesDropdown";
import DistanceDropdown from "../components/DistanceDropdown";
import WhenDropdown from "../components/WhenDropdown";

import categories from "../util/categories";
import useForm from "../util/form.hooks";
import { Chain, UID, Event } from "../api/types";
import { GenderI18nKeys } from "../api/enums";

import {
  eventGet,
  eventGetAll,
  eventCreate,
  eventUpdate,
  eventDelete,
  eventICalURL,
} from "../api/event";
import { GinParseErrors } from "../util/gin-errors";

// Media
const ClothesImage =
  "https://ucarecdn.com/90c93fe4-39da-481d-afbe-f8f67df521c3/-/resize/768x/-/format/auto/Nichon_zelfportret.jpg";

export default function Events() {
  const { t } = useTranslation();

  const [values, setValue, setValues] = useForm({
    name: "",
    sizes: [] as string[],
    genders: [] as string[],
    distance: [] as string[],
    date: [] as string[],
    longitude: "",
    latitude: "",
    description: "",
  });
  const [locationLoading, setLocationLoading] = useState(false); // I think this is primarily for styling
  const { addToastError, addModal, addToast } = useContext(ToastContext);
  const { authUser, authUserRefresh } = useContext(AuthContext);
  const [events, setEvents] = useState<Event[]>();
  const [hover, setHover] = useState(false);
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
  }, [authUser]);

  async function load() {
    try {
      let _events = (
        await eventGetAll({
          latitude: 69.880514,
          longitude: 98.599997,
          radius: 10000,
        })
      ).data;
      setEvents(_events);
      // setChains(_chains.sort((a, b) => a.name.localeCompare(b.name)));
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
            <div className="mb-8">
              <CategoriesDropdown
                className="w-[150px] md:w-[170px] mr-4 md:mr-8"
                selectedGenders={values.genders}
                handleChange={(gs) => setValue("genders", gs)}
              />
              <SizesDropdown
                filteredGenders={Object.keys(categories)}
                selectedSizes={values.sizes || []}
                className="w-[150px] md:w-[170px] mr-4 md:mr-8"
                handleChange={(v) => setValue("sizes", v)}
              />
              <WhenDropdown
                className="w-[150px] md:w-[170px] mr-4 md:mr-8"
                selectedDate={values.date}
                handleChange={(date) => setValue("date", date)}
              />
              <DistanceDropdown
                className="w-[150px] md:w-[170px] mr-4 md:mr-8"
                selectedDistance={values.distance}
                handleChange={(d) => setValue("distance", d)}
              />
              <button className="btn btn-primary">Search </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {events?.map((event) => {
                //let thisEvent = events?.find((e) => e.uid === event.uid);
                const date = new Date(event.date);
                const genders = event.genders;
                return (
                  <div className="pb-10 px-0" key={event.uid}>
                    <Link to="/eventdetails">
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
                                hover ? "opacity-60 transition ease-in-out" : ""
                              }`}
                            >
                              {/*calendar.location*/}
                              {"Mission Dolores Park"}
                            </span>
                            <div className="p-2">
                              {genders?.map((g) => {
                                return (
                                  <span className="badge badge-outline bg-teal-light mr-4" key={g}>
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
  
  function handleLocation() {
    // pop up and asks to either type in the location or ask permission to use location from browser
    // if user clicks use my location enter getLocationBrowser()
    //e.preventDefault();
    addModal({
      message: "Enter your location or allow browser to see location",
      actions: [
        {
          text: "Type in your location here",
          type: "textInput", // need to make this a text input instead of a button
          fn: () => {
            console.log("inside fn");
          },
        },
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

  function displayModal() {
    console.log("inside dispay");
    return <div className="text-lg">Please enter region, city or zip</div>;
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
