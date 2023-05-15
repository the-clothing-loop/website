import { useState, useEffect, FormEvent, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory, useLocation } from "react-router-dom";

import { GinParseErrors } from "../util/gin-errors";

import SizesDropdown from "./SizesDropdown";
import { TextForm } from "./FormFields";
import categories from "../util/categories";
import { UID, User } from "../api/types";
import FormActions from "../components/formActions";

import { PhoneFormField } from "./FormFields";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";

import { userGetByUID, userHasNewsletter } from "../api/user";

import { AuthContext } from "../providers/AuthProvider";

interface State {
  chainUID?: UID;
}
interface Params {
  userUID: UID;
}
export interface ValuesForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  sizes: string[];
  newsletter: boolean;
}
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

export default function AddressForm(props: {
  onSubmit: (values: ValuesForm) => void;
  //   e: FormEvent<HTMLFormElement>,
  classes: string;
}) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);
  const { chainUID } = useLocation<State>().state || {};
  const [user, setUser] = useState<User>();
  const { authUser } = useContext(AuthContext);
  const [values, setValue, setValues] = useForm<ValuesForm>({
    name: "",
    phone: "",
    email: "",
    sizes: [] as string[],
    address: "",
    newsletter: false,
  });
  const params = useParams<Params>();

  const userUID: string =
    params.userUID == "me" ? authUser!.uid : params.userUID;

  const [address, setAddress] = useForm({
    street: "",
    postal: "",
    city: "",
    province: "",
    country: "",
  });

  async function getPlaceName(
    street: string,
    postal: string,
    city: string,
    province: string,
    country: string
  ): Promise<string> {
    const correctAddress =
      street.replaceAll(" ", "%20") +
      "%20" +
      postal.replaceAll(" ", "%20") +
      "%20" +
      city.replaceAll(" ", "%20") +
      "%20" +
      province.replaceAll(" ", "%20") +
      "%20" +
      country.replaceAll(" ", "%20");

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${correctAddress}.json?access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    console.log(data);
    console.log(data.features[0]?.place_name);

    return data.features[0]?.place_name || "";
  }

  // If the user is logged in, we want to set values to their information
  if (authUser) {
    useEffect(() => {
      (async () => {
        try {
          const user = (await userGetByUID(chainUID, userUID)).data;
          const hasNewsletter = (await userHasNewsletter(chainUID, userUID))
            .data;
          setUser(user);
          setValues({
            name: user.name,
            phone: user.phone_number,
            email: user.email,
            sizes: user.sizes,
            address: user.address,
            newsletter: hasNewsletter,
          });
        } catch (error) {
          console.warn(error);
        }
      })();
    }, [history]);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    (async () => {
      if (
        !(address.street && address.city && address.province && address.country)
      ) {
        addToastError(t("required") + ": " + t("loopLocation"), 400);
        return;
      }
      values.address = await getPlaceName(
        address.street,
        address.postal,
        address.city,
        address.province,
        address.country
      );

      if (
        !(address.street && address.city && address.province && address.country)
      ) {
        console.error("getPlaceName", values.address);
        addToastError(t("required") + ": " + t("loopLocation"), 500);
        return;
      }
      props.onSubmit(values);
    })();
  }

  return (
    <>
      <div className={props.classes}>
        <form onSubmit={onSubmit} className="relative" id="address-form">
          <div className="mb-2">
            <TextForm
              type="text"
              autoComplete="name"
              label={t("name") + "*"}
              name="name"
              required
              min={2}
              value={values.name}
              onChange={(e) => setValue("name", e.target.value)}
            />
          </div>

          <PhoneFormField
            required
            value={values.phone}
            onChange={(e) => setValue("phone", e.target.value)}
          />
          <div className="pt-4">{t("address")}</div>
          {!authUser ? (
            <TextForm
              label={t("email") + "*"}
              name="email"
              type="email"
              required
              min={2}
              value={values.email}
              onChange={(e) => setValue("email", e.target.value)}
            />
          ) : null}

          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("streetAddress") + "*"}
              name="street-address"
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
              label={t("postal")}
              name="postal-code"
              autoComplete="postal-code"
              min={2}
              value={address.postal}
              onChange={(e) => setAddress("postal", e.target.value)}
            />
          </div>
          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("city") + "*"}
              name="city"
              autoComplete="address-level2"
              required
              min={2}
              value={address.city}
              onChange={(e) => setAddress("city", e.target.value)}
            />
          </div>
          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("stateOrProvince") + "*"}
              name="province"
              autoComplete="address-level1"
              required
              min={2}
              value={address.province}
              onChange={(e) => setAddress("province", e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("country") + "*"}
              name="country-name"
              autoComplete="country-name"
              required
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
          {!authUser ? <FormActions isNewsletterRequired={false} /> : null}
        </form>
      </div>
    </>
  );
}
