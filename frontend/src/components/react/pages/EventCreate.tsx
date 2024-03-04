import { useState } from "react";

import { eventCreate, type EventCreateBody } from "../../../api/event";

import { GinParseErrors } from "../util/gin-errors";

import EventChangeForm from "../components/EventChangeForm";

import dayjs from "../util/dayjs";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { $authUser } from "../../../stores/auth";
import { addToastError } from "../../../stores/toast";
import useLocalizePath from "../util/localize_path.hooks";

export default function EventCreate() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const authUser = useStore($authUser);
  const [submitted, setSubmitted] = useState("");

  async function onSubmit(values: EventCreateBody) {
    if (values.address.length < 6) {
      addToastError(t("required") + ": " + t("address"), 400);
      return;
    }
    if (!values.image_url) {
      addToastError(t("required") + ": " + t("uploadImage"), 400);
      return;
    }
    const today = dayjs().startOf("day");
    const now = dayjs();
    if (today.isAfter(values.date)) {
      addToastError(t("invalid") + ": " + t("date"), 400);
      return;
    }
    if (now.isAfter(values.date) /* && !(today.isAfter(values.date))*/) {
      addToastError(t("invalid") + ": " + t("time"), 400);
      return;
    }

    console.log("creating event:", values);
    if (!authUser) {
      addToastError("User is not availible", 400);
      return;
    } else {
      try {
        const res = await eventCreate(values);
        window.goatcounter?.count({
          path: "new-event",
          title: "New Event",
          event: true,
        });
        setSubmitted(res.data.uid);
      } catch (err: any) {
        console.error("Error creating event:", err, values);
        addToastError(GinParseErrors(t, err), err?.status);
      }
    }
  }

  if (!authUser) {
    return null;
  } else if (submitted) {
    window.location.href = localizePath("/events/detail/?event=" + submitted);
    return;
  } else {
    return (
      <>
        <main className="container lg:max-w-screen-lg mx-auto md:px-20 pt-4">
          <div className="bg-teal-light p-4 sm:p-8">
            <h1 className="text-center font-medium text-secondary text-5xl mb-6">
              {t("createEvent")}
            </h1>

            <EventChangeForm onSubmit={onSubmit} />

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
