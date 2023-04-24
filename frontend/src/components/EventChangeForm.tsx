import { useTranslation } from "react-i18next";
import { EventCreateBody, EVENT_IMAGE_EXPIRATION } from "../api/event";
import { TextForm } from "./FormFields";
import useForm from "../util/form.hooks";
import GeocoderSelector from "./GeocoderSelector";
import CategoriesDropdown from "./CategoriesDropdown";
import { Chain } from "../api/types";
import { deleteImage, uploadImage } from "../api/imgbb";
import {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import dayjs from "dayjs";
import { AuthContext } from "../providers/AuthProvider";
import { GinParseErrors } from "../util/gin-errors";
import { chainGet } from "../api/chain";
import { ToastContext } from "../providers/ToastProvider";

const defaultValues: EventCreateBody = {
  name: "",
  description: "",
  latitude: 0,
  longitude: 0,
  address: "",
  price: null,
  date: new Date().toISOString(),
  genders: [],
  image_url: "",
};

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
  const { authUser } = useContext(AuthContext);
  const { addToastError } = useContext(ToastContext);
  const refFileInput = useRef<HTMLInputElement>(null);
  const [values, setValue, setValues] = useForm<EventCreateBody>(
    props.initialValues || defaultValues
  );
  const [valueDate, _setValueDate] = useState(() =>
    dayjs(values.date).format("YYYY-MM-DD")
  );
  const [valueTime, _setValueTime] = useState(() =>
    dayjs(values.date).format("HH:mm")
  );
  const [deleteImageUrl, setDeleteImageUrl] = useState("");
  const [eventPriceValue, setEventPriceValue] = useState(
    () => values.price?.value || 0
  );
  const [eventPriceCurrency, _setEventPriceCurrency] = useState(
    () => values.price?.currency || ""
  );
  const { t } = useTranslation();

  function setEventPriceCurrency(e: ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;

    if (v === "") {
      _setEventPriceCurrency("");
      setEventPriceValue(0);
      return;
    }

    _setEventPriceCurrency(v);
  }

  function setValueDate(e: ChangeEvent<HTMLInputElement>) {
    const d = e.target.valueAsDate;
    console.log(d);

    if (d) {
      let _date = dayjs(values.date);
      _date.set("day", d.getDate());
      _date.set("month", d.getMonth());
      _date.set("year", d.getFullYear());
      setValue("date", _date.toISOString());
    }
    _setValueDate(e.target.value);
  }
  function setValueTime(e: ChangeEvent<HTMLInputElement>) {
    const d = e.target.valueAsDate;
    console.log(d);

    if (d) {
      let _date = dayjs(values.date);
      _date.set("hour", d.getHours());
      _date.set("minute", d.getMinutes());
      setValue("date", _date.toISOString());
    }
    _setValueTime(e.target.value);
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

    if (eventPriceValue && eventPriceCurrency) {
      values.price = { value: eventPriceValue, currency: eventPriceCurrency };
    } else {
      values.price = null;
    }

    props.onSubmit(values);
  }

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
      console.error("Unable to get loops", err);
      addToastError(GinParseErrors(t, err), err?.status);
    }
  }

  const valuesDate = dayjs(values.date);

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
                console.log(g);
                setValue("address", g.query);
                setValue("latitude", g.first?.[1] || 0);
                setValue("longitude", g.first?.[0] || 0);
              }}
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
            value={valueDate}
            onChange={setValueDate}
          />
        </div>
        <div className="">
          <TextForm
            required
            min={2}
            label={t("time") + "*"}
            name="time"
            type="time"
            value={valueTime}
            onChange={setValueTime}
          />
        </div>
        <div className="form-control">
          <label>
            <div className="label">
              <span className="label-text">{t("description")}</span>
            </div>
            <textarea
              className="textarea textarea-secondary w-full h-[300px] max-xs:h-auto"
              name="description"
              cols={3}
              value={values.description}
              onChange={(e) => setValue("description", e.target.value)}
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
                className="input input-secondary border-l-0 w-full flex-grow"
                disabled={eventPriceCurrency === ""}
                name="price"
                onClick={(e) => (e.target as any).select()}
                type="number"
                value={eventPriceValue}
                onChange={(e) => setEventPriceValue(e.target.valueAsNumber)}
              />
            </div>
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
                  <span className="feather feather-upload ml-4"></span>
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
              <span className="feather feather-arrow-right ml-4"></span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
