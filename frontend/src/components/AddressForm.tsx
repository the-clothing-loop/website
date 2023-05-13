import { useState, useEffect, FormEvent, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory, useLocation } from "react-router-dom";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { GinParseErrors } from "../util/gin-errors";

import SizesDropdown from "./SizesDropdown";
import { TextForm } from "./FormFields";
import categories from "../util/categories";
import { UID, User } from "../api/types";

import { PhoneFormField } from "./FormFields";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";

import {
  userGetByUID,
  userHasNewsletter,
  userUpdate,
  UserUpdateBody,
} from "../api/user";

import { AuthContext } from "../providers/AuthProvider";

interface Props {
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    address: string,
    sizes: string[]
  ) => void;
  classes: string;
}
interface State {
  chainUID?: UID;
}
interface Params {
  userUID: UID;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

export default function AddressForm(props: Props) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);
  const { chainUID } = useLocation<State>().state || {};
  const [user, setUser] = useState<User>();
  const { authUser } = useContext(AuthContext);
  const [values, setValue, setValues] = useForm({
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
    cityState: "",
    country: "",
  });
  const userIsAnyChainAdmin = useMemo(
    () => !!user?.chains.find((uc) => uc.is_chain_admin),
    [user]
  );
  useEffect(() => {
    (async () => {
      if (MAPBOX_TOKEN) {
        const correctAddress =
          address.street.replaceAll(" ", "%20") +
          "%20" +
          address.postal +
          "%20" +
          address.cityState.replaceAll(" ", "%20");

        window.axios
          .get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${correctAddress}.json?access_token=${MAPBOX_TOKEN}`
          )
          .then((response) => {
            if (response.data.features[0]) {
              console.log(response);
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

  // If the user is logged in, we want to to prefill fields with their information
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
    const address = values.address;
    props.onSubmit(e, address, values.sizes);
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
              enterKeyHint="next"
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
          {/* Don't show email if user is logged in */}
          {!authUser ? (
            <TextForm
              label={t("email") + "*"}
              name="email"
              type="email"
              required
            />
          ) : null}

          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("streetAddress")}
              name="streetAddress"
              autoComplete="street-address"
              enterKeyHint="next"
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
              name="postal"
              autoComplete="postal-code"
              enterKeyHint="next"
              min={2}
              value={address.postal}
              onChange={(e) => setAddress("postal", e.target.value)}
            />
          </div>

          <div className="form-control mb-4">
            <TextForm
              type="text"
              label={t("city")}
              name="city"
              autoComplete="city"
              enterKeyHint="next"
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
              autoComplete="country-name"
              enterKeyHint="done"
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
