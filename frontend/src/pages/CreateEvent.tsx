import { useContext, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

import { TextForm } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { AuthContext } from "../providers/AuthProvider";
import { eventCreate, EventCreateBody } from "../api/event";
import FormJup from "../util/form-jup";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";
import CategoriesDropdown from "../components/CategoriesDropdown";

import { GinParseErrors } from "../util/gin-errors";
import dayjs from "../util/dayjs";
import { Link } from "react-router-dom";

interface FormJsValues {
  address: string;
  description: string;
  genders: string[];
}

interface FormHtmlValues {
  name: string;
  date: Date;
  time: string;
}

export default function CreateEvent() {
  const { t } = useTranslation();
  const history = useHistory();
  const authUser = useContext(AuthContext).authUser;
  const { addToastError } = useContext(ToastContext);
  const [jsValues, setJsValue, setJsValues] = useForm<FormJsValues>({
    address: "",
    description: "",
    genders: [],
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const values = FormJup<FormHtmlValues>(e);
    console.info("submit", { ...values, ...jsValues });

    if (jsValues.address.length < 6) {
      addToastError(t("required") + ": " + t("address"), 400);
      return;
    }

    let newEvent: EventCreateBody = {
      name: values.name,
      description: jsValues.description,
      address: jsValues.address,
      latitude: 23.766492,
      longitude: 0.303334,
      genders: jsValues.genders,
      date: dayjs(values.date).format(),
      user_name: authUser!.name,
      user_email: authUser!.email,
      user_phone: authUser!.phone_number,
      chain_name: "",
    };

    console.log(`creating event: ${JSON.stringify(newEvent)}`);

    if (!authUser) {
      addToastError("User is not availible", 400);
      return;
    } else {
      try {
        await eventCreate(newEvent);
        if (window.goatcounter)
          window.goatcounter.count({
            path: "new-event",
            title: "New Event",
            event: true,
          });
        history.replace("/events");
      } catch (err: any) {
        console.error("Error creating event:", err, newEvent);
        addToastError(GinParseErrors(t, err), err?.status);
      }
    }
  }

  if (!authUser) {
    return (
      <div className="max-w-screen-sm mx-auto flex-grow flex flex-col justify-center items-center">
        <h1 className="font-serif text-secondary text-4xl font-bold my-10">
          You must login to view this page
        </h1>
        <div className="flex">
          <Link to="/users/login" className="btn btn-primary mx-4">
            {t("login")}
          </Link>
          <Link to="/events" className="btn btn-primary mx-4">
            {t("events")}
          </Link>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <Helmet>
          <title>The Clothing Loop | Create New Event</title>
          <meta name="description" content="Create user for new loop" />
        </Helmet>
        <main className="container lg:max-w-screen-lg mx-auto md:px-20 pt-4">
          <div className="bg-teal-light p-8">
            <h1 className="text-center font-medium text-secondary text-5xl mb-6">
              Create a Swapping Event
            </h1>
            <div className="w-full md:pl-4">
              <form onSubmit={onSubmit}>
                <TextForm
                  min={2}
                  required
                  label={t("eventName") + "*"}
                  name="name"
                  type="text"
                />
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      {t("eventAddress") + "*"}
                    </span>
                  </div>
                  <GeocoderSelector
                    required
                    onResult={(g) => setJsValue("address", g.query)}
                  />
                </label>
                <TextForm
                  required
                  min={2}
                  label={t("date") + "*"}
                  name="date"
                  type="date"
                />
                <TextForm
                  required
                  min={2}
                  label={t("time") + "*"}
                  name="time"
                  type="time"
                />
                <div className="form-control relative w-full">
                  <label>
                    <div className="label">
                      <span className="label-text">{t("description")}</span>
                    </div>
                    <textarea
                      className="textarea textarea-secondary w-full"
                      name="description"
                      cols={3}
                      value={jsValues.description}
                      onChange={(e) =>
                        setJsValue("description", e.target.value)
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row items-end mb-6">
                  <div className="w-full sm:w-1/2 pb-4 sm:pb-0 sm:pr-4">
                    <CategoriesDropdown
                      className="w-[150px] md:w-[170px] mr-4 md:mr-8 py-4 pb-2 md:py-0"
                      selectedGenders={jsValues.genders}
                      handleChange={(gs) => {
                        setJsValue("genders", gs);
                      }}
                    />
                    {console.log(jsValues.genders)}
                  </div>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn btn-primary">
                    {t("next")}
                    <span className="feather feather-arrow-right ml-4"></span>
                  </button>
                </div>
              </form>
            </div>
            <div className="text-sm text-center mt-4 text-black/80">
              <p>{t("troublesWithTheSignupContactUs")}</p>
              <a
                className="link"
                href="mailto:hello@clothingloop.org?subject=Troubles signing up to The Clothing Loop"
              >
                hello@clothingloop.org
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }
}
