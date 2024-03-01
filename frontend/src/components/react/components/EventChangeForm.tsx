import {
  type EventCreateBody,
  EVENT_IMAGE_EXPIRATION,
} from "../../../api/event";
import { TextForm } from "./FormFields";
import useForm from "../util/form.hooks";
import GeocoderSelector from "./GeocoderSelector";
import CategoriesDropdown from "./CategoriesDropdown";
import type { Chain } from "../../../api/types";
import { deleteImage, uploadImage } from "../../../api/imgbb";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import dayjs from "../util/dayjs";
import { $authUser } from "../../../stores/auth";
import { GinParseErrors } from "../util/gin-errors";
import { chainGet } from "../../../api/chain";
import { addToastError } from "../../../stores/toast";
import { useSepDateTime } from "../util/sep-date-time.hooks";
import { TinyMCE } from "./TinyMCE";
import { GEOJSON_LATITUDE_INDEX, GEOJSON_LONGITUDE_INDEX } from "../util/maps";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";

const defaultValues: EventCreateBody = {
  name: "",
  description: "",
  latitude: 0,
  longitude: 0,
  address: "",
  price_currency: "€",
  price_value: 0,
  link: "",
  date: dayjs().minute(0).second(0).format(),
  date_end: null,
  genders: [],
  image_url: "",
};

const INVALID_DATE_STRING = "Invalid Date";

const currencies = [
  "€",
  "$",
  "£",
  "¥",
  "CHF",
  "؋",
  "ƒ",
  "₼",
  "Br",
  "KM",
  "P",
  "лв",
  "៛",
  "₡",
  "kn",
  "₱",
  "Kč",
  "kr",
  "¢",
  "Q",
  "L",
  "Ft",
  "Rp",
  "﷼",
  "₪",
  "₩",
  "₭",
  "ден",
  "RM",
  "₨",
  "₮",
  "MT",
  "₦",
  "Gs",
  "zł",
  "lei",
  "₽",
  "Дин.",
  "S",
  "R",
  "₴",
  "Bs",
  "₫",
];

export default function EventChangeForm(props: {
  initialValues?: EventCreateBody;
  onSubmit: (v: EventCreateBody) => void;
}) {
  const { t } = useTranslation();
  const authUser = useStore($authUser);
  const refFileInput = useRef<HTMLInputElement>(null);

  const [values, setValue, setValues] = useForm<EventCreateBody>(
    props.initialValues || defaultValues,
  );
  const sepDate = useSepDateTime(values.date, (d) => setValue("date", d));
  const [hasEndDate, setHasEndDate] = useState(values.date_end !== null);
  const [firstSetDefaultEndDate, setFirstSetDefaultEndDate] = useState(false);
  const [dateEnd, setDateEnd] = useState(
    values.date_end ||
      dayjs(values.date).add(2, "hour").minute(0).second(0).format(),
  );
  const sepDateEnd = useSepDateTime(dateEnd, setDateEnd);
  const [deleteImageUrl, setDeleteImageUrl] = useState("");
  const [eventPriceValue, setEventPriceValue] = useState(
    () => values.price_value || 0,
  );
  const [eventPriceText, _setEventPriceText] = useState(() =>
    eventPriceValue.toFixed(2),
  );
  const setEventPriceText = (text: string) => {
    if (validatePrice(text)) {
      const value = Number.parseFloat(text);
      if (!Number.isNaN(value)) setEventPriceValue(value);
    }
    _setEventPriceText(text);
  };
  const [eventPriceCurrency, _setEventPriceCurrency] = useState(
    () => values.price_currency || "",
  );
  const [chains, setChains] = useState<Chain[]>([]);

  useEffect(() => {
    getChains();
  }, []);

  useEffect(() => {}, [props.initialValues]);

  function setEventPriceCurrency(e: ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;

    if (v === "") {
      _setEventPriceCurrency("");
      setEventPriceText("0");
      return;
    } else if (eventPriceValue === 0) {
      setEventPriceText("1");
    }

    _setEventPriceCurrency(v);
  }

  async function onImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImage(file, 800, EVENT_IMAGE_EXPIRATION);
    console.log(res.data);
    setValue("image_url", res.data.image);
    setDeleteImageUrl(res.data.delete);
  }

  async function onImageDelete() {
    if (deleteImageUrl) {
      await deleteImage(deleteImageUrl);
      setValue("image_url", "");
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();

    values.date_end = hasEndDate ? dateEnd : null;

    if (eventPriceCurrency && eventPriceValue == 0) {
      values.price_value = 0;
      values.price_currency = "";
    } else if (eventPriceCurrency && eventPriceValue != 0) {
      values.price_value = eventPriceValue;
      values.price_currency = eventPriceCurrency;
    } else {
      values.price_value = 0;
      values.price_currency = "";
    }
    props.onSubmit(values);
  }

  async function getChains() {
    if (!authUser) return;
    let chainUIDs = authUser.chains
      .filter((uc) => uc.is_chain_admin)
      .map((uc) => uc.chain_uid);

    try {
      const _chains = await Promise.all(
        chainUIDs.map((uid) => chainGet(uid).then((res) => res.data)),
      );
      setChains(_chains);
    } catch (err: any) {
      console.error("Unable to get loops", err);
      addToastError(GinParseErrors(t, err), err?.status);
    }
  }

  const isValidPrice = validatePrice(eventPriceText);

  console.log("initial values: ", props.initialValues);
  console.log("Date values: ", values.date);
  console.log("Date End values: ", values.date_end);
  console.log("Date End calc: ", dateEnd);

  return (
    <div className="w-full">
      <form onSubmit={submit} className="grid gap-x-4 sm:grid-cols-2">
        <div className="col-span-1 sm:col-span-2">
          <TextForm
            min={2}
            required
            label={t("eventName") + "*"}
            name="name"
            type="text"
            value={values.name}
            onChange={(e) => setValue("name", e.target.value)}
          />
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">{t("address") + "*"}</span>
            </div>
            <GeocoderSelector
              address={values.address}
              required
              onResult={(g) => {
                setValue("address", g.query);
                setValue("latitude", g.first?.[GEOJSON_LATITUDE_INDEX] || 0);
                setValue("longitude", g.first?.[GEOJSON_LONGITUDE_INDEX] || 0);
              }}
            />
          </label>
        </div>
        <div>
          <TextForm
            required
            min={2}
            label={t("date") + "*"}
            type="date"
            name="date"
            value={sepDate.date.value}
            onChange={(e) => {
              sepDateEnd.date.onChange(e);
              sepDate.date.onChange(e);
            }}
          />
        </div>
        <div>
          <TextForm
            required
            min={2}
            label={hasEndDate ? t("startTime") + "*" : t("time") + "*"}
            name="time"
            type="time"
            value={sepDate.time.value}
            onChange={sepDate.time.onChange}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <div className={`mb-3 mt-5 ${hasEndDate ? "bg-base-100" : ""}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 -mt-2">
              <label className="inline-flex cursor-pointer p-4 transition-colors bg-base-100 bg-opacity-0 hover:bg-opacity-70">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-secondary ltr:mr-3 rtl:ml-3"
                  checked={hasEndDate}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (!checked) setValue("date_end", null);
                    if (
                      checked &&
                      !props.initialValues &&
                      !firstSetDefaultEndDate
                    ) {
                      setFirstSetDefaultEndDate(true);
                      let d = dayjs(values.date);
                      sepDateEnd.date.onChange({
                        target: {
                          valueAsDate: d.toDate(),
                          value: d.format("YYYY-MM-DD"),
                        },
                      } as any);
                    }
                    setHasEndDate(checked);
                  }}
                />
                <span>{t("endTime")}</span>
              </label>
              {hasEndDate ? (
                <div className="pb-4">
                  <TextForm
                    required
                    min={2}
                    label={t("endTime") + "*"}
                    name="time"
                    type="time"
                    value={sepDateEnd.time.value}
                    onChange={sepDateEnd.time.onChange}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="form-control">
          <label>
            <div className="label">
              <span className="label-text">{t("description")}</span>
            </div>
            <TinyMCE
              name="description"
              value={values.description}
              onChange={(value) => setValue("description", value)}
            />
          </label>
        </div>
        <div>
          <div className="mb-4">
            <label>
              <div className="label">
                <span className="label-text">{t("categories") + "*"}</span>
              </div>
              <CategoriesDropdown
                className="w-full mr-4 md:mr-8 py-4 pb-2 md:py-0"
                selectedGenders={values.genders}
                handleChange={(gs) => setValue("genders", gs)}
              />
            </label>
          </div>

          <div className="mb-4">
            <div className="label">
              <span className="label-text">{t("price") + "*"}</span>
            </div>
            <div className="input-group">
              <select
                name="chain_uid"
                defaultValue="EUR"
                onChange={setEventPriceCurrency}
                value={eventPriceCurrency}
                className="select select-secondary select-outlined"
              >
                <option value="" key="none" defaultChecked>
                  {t("none")}
                </option>
                {currencies.map((currency, i) => (
                  <option key={i} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <input
                className={`input ltr:border-l-0 rtl:border-r-0  w-full flex-grow ${
                  isValidPrice ? "input-secondary" : "input-error"
                }`}
                disabled={eventPriceCurrency === ""}
                name="price"
                onClick={(e) => (e.target as any).select()}
                type="number"
                inputMode="decimal"
                aria-invalid={isValidPrice}
                value={eventPriceText}
                onChange={(e) => setEventPriceText(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <TextForm
              label={t("eventLink") + "*"}
              name="link"
              type="url"
              value={values.link}
              onChange={(e) => setValue("link", e.target.value)}
            />
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
                {deleteImageUrl ? (
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
                  onClick={() => refFileInput.current?.click()}
                >
                  {t("uploadImage")}
                  <span className="feather feather-upload ltr:ml-4 rtl:mr-4"></span>
                </button>
              </div>
              {values.image_url ? (
                <img
                  className="w-full h-full object-cover"
                  src={values.image_url}
                  alt="Event image"
                />
              ) : null}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              {t("submit")}
              <span className="feather feather-arrow-right ltr:ml-4 rtl:mr-4"></span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function validatePrice(value: string) {
  return /^\d+([.,]\d{1,2})?$/.test(value);
}
