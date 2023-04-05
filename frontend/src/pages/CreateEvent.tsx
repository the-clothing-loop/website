import { useContext, FormEvent, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Redirect } from "react-router-dom";
import { chainGet } from "../api/chain";
import { Chain } from "../api/types";

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
  const authUser = useContext(AuthContext).authUser;
  const { addToastError } = useContext(ToastContext);
  const [jsValues, setJsValue] = useForm<FormJsValues>({
    address: "",
    description: "",
    genders: [],
  });
  const [submitted, setSubmitted] = useState("");
  const [chain, setChain] = useState<Chain | null>(null);
  useEffect(() => {
    getChain();
  }, []);

  async function getChain() {
    let chainUID = authUser!.chains[0].chain_uid;
    let _chain: Chain;

    try {
      chainGet(chainUID).then((res) => {
        _chain = res.data;
        setChain(_chain);
      });
    } catch (err: any) {
      console.error(`chain ${chainUID} does not exist`);
    }
  }

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
      latitude: 52.377956,
      longitude: 4.89707,
      genders: jsValues.genders,
      date: dayjs(values.date).format(),
      user_uid: authUser!.uid,
      user_name: authUser!.name,
      user_email: authUser!.email,
      chain_uid: authUser!.chains[0].chain_uid,
      chain_name: chain!.name,
    };

    console.log(`creating event: ${JSON.stringify(newEvent)}`);

    if (!authUser) {
      addToastError("User is not availible", 400);
      return;
    } else {
      try {
        const res = await eventCreate(newEvent);
        if (window.goatcounter)
          window.goatcounter.count({
            path: "new-event",
            title: "New Event",
            event: true,
          });
        setSubmitted(res.data.uid);
      } catch (err: any) {
        console.error("Error creating event:", err, newEvent);
        addToastError(GinParseErrors(t, err), err?.status);
      }
    }
  }

  if (!authUser) {
    return <Redirect to={"/"} />;
  } else if (submitted) {
    return <Redirect to={"/events/" + submitted} />;
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
              {t("createEvent")}
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
                      className="textarea textarea-secondary w-full mb-4"
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
