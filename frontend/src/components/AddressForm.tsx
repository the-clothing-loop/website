import { useEffect, FormEvent, useContext } from "react";
import { useTranslation } from "react-i18next";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { GinParseErrors } from "../util/gin-errors";

import SizesDropdown from "./SizesDropdown";
import { TextForm } from "./FormFields";
import categories from "../util/categories";
import { UID } from "../api/types";

import { PhoneFormField } from "./FormFields";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";

interface Props {
  onSubmit: (e: FormEvent<HTMLFormElement>, address: string) => void;
  classes: string;
}
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

export default function AddressForm(props: Props) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);

  const [values, setValue, setValues] = useForm({
    name: "",
    phone: "",
    email: "",
    sizes: [] as string[],
    address: "",
    newsletter: false,
  });

  const [address, setAddress] = useForm({
    street: "",
    zip: "",
    cityState: "",
    country: "",
  });

  useEffect(() => {
    (async () => {
      if (MAPBOX_TOKEN) {
        const correctAddress =
          address.street.replaceAll(" ", "%20") +
          "%20" +
          address.zip +
          "%20" +
          address.cityState.replaceAll(" ", "%20");

        window.axios
          .get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${correctAddress}.json?access_token=${MAPBOX_TOKEN}`
          )
          .then((response) => {
            if (response.data.features[0]) {
              var placeName = response.data.features[0].place_name;
              setValue("address", placeName);
            }
          })
          .catch((err: any) => {
            console.error("Error getting address from MapBox:", err, values);
            addToastError(GinParseErrors(t, err), err?.status);
          });
      }
    })();
  }, [address]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const address = values.address;
    props.onSubmit(e, address);
  }

  return (
    <>
      <div className={props.classes}>
        <form onSubmit={onSubmit} className="relative" id="address-form">
          <div className="mb-2">
            <TextForm
              type="text"
              autoComplete="name"
              label={t("name")}
              name="name"
              required
              min={2}
              value={values.name}
              onChange={(e) => setValue("name", e.target.value)}
            />
          </div>

          <PhoneFormField
            value={values.phone}
            onChange={(e) => setValue("phone", e.target.value)}
          />
          <TextForm
            label={t("email") + "*"}
            name="email"
            type="email"
            required
          />
          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("streetAddress")}
              name="streetAddress"
              autoComplete="street-address"
              required
              min={2}
              value={address.street}
              onChange={(e) => setAddress("street", e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("zip")}
              name="zip"
              autoComplete="postal-code"
              min={2}
              value={address.zip}
              onChange={(e) => setAddress("zip", e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("city")}
              name="city"
              autoComplete="city"
              min={2}
              value={address.cityState}
              onChange={(e) => setAddress("cityState", e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("country")}
              name="country"
              autoComplete="country"
              min={2}
              value={address.country}
              onChange={(e) => setAddress("country", e.target.value)}
            />
          </div>

          <div className="mb-4 pt-3">
            <SizesDropdown
              filteredGenders={Object.keys(categories)}
              selectedSizes={values.sizes || []}
              className="w-full"
              handleChange={(v) => setValue("sizes", v)}
            />
          </div>
        </form>
      </div>
    </>
  );
}
