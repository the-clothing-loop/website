import {
  useContext,
  FormEvent,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { TextForm } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { AuthContext } from "../providers/AuthProvider";
import {
  eventCreate,
  EventCreateBody,
  eventImageExpiration,
} from "../api/event";
import FormJup from "../util/form-jup";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";
import CategoriesDropdown from "../components/CategoriesDropdown";

import { GinParseErrors } from "../util/gin-errors";
import dayjs from "../util/dayjs";
import { Redirect } from "react-router-dom";
import { chainGet } from "../api/chain";
import { Chain, UID } from "../api/types";
import { deleteImage, uploadImage, UploadImageBody } from "../api/imgbb";

interface FormJsValues {
  address: string;
  description: string;
  genders: string[];
}

interface FormHtmlValues {
  name: string;
  date: Date;
  time: string;
  chain_uid: UID;
}

export default function CreateEvent() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const { addToastError } = useContext(ToastContext);
  const refFileInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<UploadImageBody>();
  const [jsValues, setJsValue] = useForm<FormJsValues>({
    address: "",
    description: "",
    genders: [],
  });
  const [submitted, setSubmitted] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  useEffect(() => {
    getChains();
  }, []);

  async function getChains() {
    let chainUIDs = authUser!.chains
      .filter((uc) => uc.is_chain_admin)
      .map((uc) => uc.chain_uid);

    try {
      const _chains = await Promise.all(
        chainUIDs.map((uid) => chainGet(uid).then((res) => res.data))
      );
      setChains(_chains);
    } catch (err: any) {
      if (Array.isArray(err)) {
      }

      console.error("Unable to get loops", err);
      addToastError(GinParseErrors(t, err), err?.status);
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

    if (!image) {
      addToastError(t("required") + ": " + t("uploadImage"), 400);
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
      image_url: image.image,
      image_delete_url: image.delete,
    };
    if (values.chain_uid) newEvent.chain_uid = values.chain_uid;
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

  function onClickUploadBtn() {
    refFileInput.current?.click();
  }

  async function onImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImage(file.slice(), 800, eventImageExpiration);
    console.log(res.data);
    setImage(res.data);
  }

  async function onImageDelete() {
    if (image && image.delete) {
      await deleteImage(image.delete);
      setImage(undefined);
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
          <div className="bg-teal-light p-8">
            <h1 className="text-center font-medium text-secondary text-5xl mb-6">
              {t("createEvent")}
            </h1>
            <div className="w-full">
              <form onSubmit={onSubmit} className="grid gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextForm
                    min={2}
                    required
                    label={t("eventName") + "*"}
                    name="name"
                    type="text"
                  />
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">{t("address") + "*"}</span>
                    </div>
                    <GeocoderSelector
                      required
                      onResult={(g) => setJsValue("address", g.query)}
                    />
                  </label>
                </div>
                <div className="">
                  <TextForm
                    required
                    min={2}
                    label={t("date") + "*"}
                    type="date"
                    name="date"
                  />
                </div>
                <div className="">
                  <TextForm
                    required
                    min={2}
                    label={t("time") + "*"}
                    name="time"
                    type="time"
                  />
                </div>
                <div className="form-control">
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
                <div>
                  <div className="mb-4">
                    <label>
                      <div className="label">
                        <span className="label-text">
                          {t("categories") + "*"}
                        </span>
                      </div>
                      <CategoriesDropdown
                        className="w-full mr-4 md:mr-8 py-4 pb-2 md:py-0"
                        selectedGenders={jsValues.genders}
                        handleChange={(gs) => {
                          setJsValue("genders", gs);
                        }}
                      />
                    </label>
                  </div>

                  <div className="mb-6">
                    <label>
                      <div className="label">
                        <span className="label-text">{t("relatedLoop")}</span>
                      </div>
                      <select
                        name="chain_uid"
                        defaultValue=""
                        className="w-full select select-secondary select-outlined"
                      >
                        <option value="" defaultChecked>
                          {t("none")}
                        </option>
                        {chains.map((chain) => (
                          <option key={chain.uid} value={chain.uid}>
                            {chain.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mb-6 flex sm:justify-center">
                    <input
                      type="file"
                      className="hidden"
                      onChange={onImageUpload}
                      ref={refFileInput}
                    />
                    <div className="relative w-full sm:w-96 aspect-[4/3] border-2 border-secondary flex justify-end items-top">
                      <div className="absolute z-10 flex flex-row">
                        {image?.delete ? (
                          <button
                            key="delete"
                            type="button"
                            className="btn btn-error"
                            onClick={onImageDelete}
                          >
                            <span className="feather feather-trash" />
                          </button>
                        ) : null}
                        <button
                          key="upload"
                          type="button"
                          className="btn btn-secondary"
                          onClick={onClickUploadBtn}
                        >
                          {t("uploadImage")}
                          <span className="feather feather-upload ml-4"></span>
                        </button>
                      </div>
                      {image ? (
                        <img
                          className="w-full h-full object-cover"
                          src={image.image}
                          alt="Event image"
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                      {t("next")}
                      <span className="feather feather-arrow-right ml-4"></span>
                    </button>
                  </div>
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
