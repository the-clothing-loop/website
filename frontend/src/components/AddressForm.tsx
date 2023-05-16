import { useState, useEffect, FormEvent, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";

import SizesDropdown from "./SizesDropdown";
import { TextForm } from "./FormFields";
import categories from "../util/categories";
import { UID } from "../api/types";
import FormActions from "../components/formActions";

import { PhoneFormField } from "./FormFields";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";
import PopoverOnHover from "./Popover";
import { userGetByUID, userHasNewsletter } from "../api/user";

import { AuthContext } from "../providers/AuthProvider";

interface State {
  chainUID?: UID;
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
  classes?: string;
  isNewsletterRequired?: boolean;
}) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);
  const { chainUID } = useLocation<State>().state || {};
  const { authUser } = useContext(AuthContext);
  const [values, setValue, setValues] = useForm<ValuesForm>({
    name: "",
    phone: "",
    email: "",
    sizes: [] as string[],
    address: "",
    newsletter: false,
  });
  const [address, setAddress] = useForm({
    street: "",
    postal: "",
    city: "",
    province: "",
    country: "",
  });
  const params = useParams<State>();

  const userUID: string =
    params.userUID == "me" ? authUser!.uid : params.userUID;

  // If the user is logged in, we want to set values to their information
  if (authUser) {
    useEffect(() => {
      (async () => {
        try {
          const user = (await userGetByUID(chainUID, userUID)).data;
          const hasNewsletter = (await userHasNewsletter(chainUID, userUID))
            .data;
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

  function checkNewsletter() {
    let newsletter = document.getElementsByName(
      "newsletter"
    )[0] as HTMLInputElement;
    if (newsletter) {
      setValue("newsletter", newsletter.checked);
    }
  }

  async function getPlaceName(address: string): Promise<string> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    return data.features[0]?.place_name || "";
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    (async () => {
      if (
        !(address.street && address.city && address.province && address.country)
      ) {
        addToastError(t("required") + ": " + t("address"), 400);
        return;
      }

      const formattedAddress =
        address.street.replaceAll(" ", "%20") +
        "%20" +
        address.postal.replaceAll(" ", "%20") +
        "%20" +
        address.city.replaceAll(" ", "%20") +
        "%20" +
        address.province.replaceAll(" ", "%20") +
        "%20" +
        address.country.replaceAll(" ", "%20");

      values.address = await getPlaceName(formattedAddress);

      if (
        !(address.street && address.city && address.province && address.country)
      ) {
        console.error("getPlaceName", values.address);
        addToastError(t("required") + ": " + t("address"), 500);
        return;
      }
      props.onSubmit(values);
    })();
  }

  return (
    <>
      <div className={props.classes}>
        <form
          onSubmit={onSubmit}
          className="relative space-y-4"
          id="address-form"
        >
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

          <PhoneFormField
            required
            value={values.phone}
            onChange={(e) => setValue("phone", e.target.value)}
          />
          <div>{t("address")}</div>
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

          <TextForm
            type="text"
            label={t("postal")}
            name="postal-code"
            autoComplete="postal-code"
            min={2}
            value={address.postal}
            onChange={(e) => setAddress("postal", e.target.value)}
          />
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
          <TextForm
            type="text"
            label={t("province") + "*"}
            name="province"
            autoComplete="address-level1"
            required
            min={2}
            value={address.province}
            onChange={(e) => setAddress("province", e.target.value)}
          />

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
          <div className="mb-4 pt-3">
            <SizesDropdown
              filteredGenders={Object.keys(categories)}
              selectedSizes={values.sizes || []}
              className="w-full"
              handleChange={(v) => setValue("sizes", v)}
            />
          </div>
          {!authUser ? (
            <div>
              <PopoverOnHover
                className="tooltip-right"
                message={t("weWouldLikeToKnowThisEquallyRepresented")}
              />
              <div onClick={checkNewsletter}>
                <FormActions
                  isNewsletterRequired={props.isNewsletterRequired || false}
                />
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </>
  );
}
