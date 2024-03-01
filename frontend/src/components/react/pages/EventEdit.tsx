import { useEffect, useState } from "react";

import {
  type EventCreateBody,
  eventGet,
  eventUpdate,
} from "../../../api/event";
import EventChangeForm from "../components/EventChangeForm";

import { GinParseErrors } from "../util/gin-errors";
import { useTranslation } from "react-i18next";
import getQuery from "../util/query";
import { addToastError } from "../../../stores/toast";
import useLocalizePath from "../util/localize_path.hooks";

export default function EventEdit() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  const [initialValues, setInitialValues] = useState<EventCreateBody>();
  const [eventUID] = getQuery("event");

  function submit(values: EventCreateBody) {
    eventUpdate({
      uid: eventUID,
      ...values,
    })
      .then(() => {
        window.location.href = localizePath(
          "/events/details?event=" + eventUID,
        );
      })
      .catch((err: any) => {
        console.error("Error creating event:", err, values);
        addToastError(GinParseErrors(t, err), err?.status);
      });
  }

  useEffect(() => {
    eventGet(eventUID).then((res) => {
      setInitialValues({
        name: res.data.name,
        description: res.data.description,
        latitude: res.data.latitude,
        longitude: res.data.longitude,
        address: res.data.address,
        price_currency: res.data.price_currency,
        price_value: res.data.price_value,
        link: res.data.link,
        date: res.data.date,
        date_end: res.data.date_end,
        genders: res.data.genders || [],
        chain_uid: res.data.chain_uid,
        image_url: res.data.image_url || "",
      });
    });
  }, []);

  return (
    <>
      <main className="container lg:max-w-screen-lg mx-auto md:px-20 pt-4">
        <div className="bg-teal-light p-8">
          <h1 className="text-center font-medium text-secondary text-5xl mb-6">
            {t("editEvent")}
          </h1>
          {initialValues ? (
            <EventChangeForm initialValues={initialValues} onSubmit={submit} />
          ) : null}
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
