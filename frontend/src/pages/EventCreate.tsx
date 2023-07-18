import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { AuthContext } from "../providers/AuthProvider";
import { eventCreate, EventCreateBody } from "../api/event";
import { ToastContext } from "../providers/ToastProvider";

import { GinParseErrors } from "../util/gin-errors";
import { Redirect } from "react-router-dom";
import EventChangeForm from "../components/EventChangeForm";

import dayjs from "../util/dayjs";

export default function EventCreate() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const { addToastError } = useContext(ToastContext);
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
    return <Redirect to={"/events/" + submitted} />;
  } else {
    return (
      <>
        <Helmet>
          <title>The Clothing Loop | Create New Event</title>
          <meta name="description" content="Create user for new loop" />
        </Helmet>
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
