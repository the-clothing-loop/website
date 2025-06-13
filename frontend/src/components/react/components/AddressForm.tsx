import { useEffect, type FormEvent, useState, type MouseEvent } from "react";
import { Trans, useTranslation } from "react-i18next";

import SizesDropdown from "./SizesDropdown";
import { TextForm } from "./FormFields";
import categories from "../util/categories";

import { PhoneFormField } from "./FormFields";
import useForm from "../util/form.hooks";
import { addToastError } from "../../../stores/toast";
import PopoverOnHover from "./Popover";
import {
  userCheckEmailExists,
  userGetByUID,
  userHasNewsletter,
} from "../../../api/user";

import { isValidPhoneNumber } from "react-phone-number-input/max";
import { $authUser } from "../../../stores/auth";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useStore } from "@nanostores/react";
import useLocalizePath from "../util/localize_path.hooks";
import type { UserCreateRequest } from "../../../api/typex2";
import { CoordsFromMapbox } from "../util/maps";

export type ValuesForm = UserCreateRequest;

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_KEY;

export default function AddressForm(props: {
  onSubmit: (values: ValuesForm) => void;
  userUID: string | undefined;
  chainUID?: string;
  classes?: string;
  isNewsletterRequired?: boolean;
  showTosPrivacyPolicy?: boolean;
  showNewsletter?: boolean;
  onlyShowEditableAddress?: boolean;
  onEmailExist?: (email: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const authUser = useStore($authUser);
  const [values, setValue, setValues] = useForm<ValuesForm>({
    name: "",
    phone_number: "",
    email: "",
    sizes: [] as string[],
    address: "",
    newsletter: false,
    latitude: 0,
    longitude: 0,
  });
  const [address, setAddress] = useForm({
    street: "",
    postal: "",
    city: "",
    province: "",
    country: "",
  });
  const [openAddress, setOpenAddress] = useState(
    () => !!props.onlyShowEditableAddress,
  );

  const [openCheckAddress, setOpenCheckAddress] = useState<boolean>(false);
  const [useUserInput, setUseUserInput] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // If the user is logged in, we want to set values to their information
  useEffect(() => {
    if (authUser && props.userUID) {
      (async () => {
        try {
          const [userReq, hasNewsletterReq] = await Promise.all([
            userGetByUID(props.chainUID, props!.userUID!, {
              addApprovedTOH: false,
            }),
            userHasNewsletter(props.chainUID, props.userUID!),
          ]);
          const user = userReq.data;
          setValues({
            name: user.name,
            phone_number: user.phone_number,
            email: user.email!,
            sizes: user.sizes,
            address: user.address,
            newsletter: hasNewsletterReq.data,
            latitude: 0,
            longitude: 0,
          });
        } catch (error) {
          console.warn(error);
        }
      })();
    }
  }, []);

  async function firstMapboxAddressDetails(
    address: string,
  ): Promise<MapboxGeocoder.Result | undefined> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${MAPBOX_TOKEN}&types=address`,
    );
    const data = await response.json();
    return data.features[0];
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    (async () => {
      if (!isValidPhoneNumber(values.phone_number)) {
        addToastError(t("enterValidPhoneNumberWithCountryCode"), 400);
        return;
      }
      if (openAddress) {
        if (!(address.street && address.city && address.country)) {
          addToastError(t("required") + ": " + t("address"), 400);
          return;
        }
        const addressConcatenated =
          address.street +
          " " +
          address.postal +
          " " +
          address.city +
          " " +
          address.province +
          " " +
          address.country;

        const formattedAddress = addressConcatenated.replaceAll(" ", "%20");
        const mapboxResult = await firstMapboxAddressDetails(formattedAddress);
        if (useUserInput) {
          values.address = addressConcatenated;
        } else {
          if (mapboxResult) {
            values.address = mapboxResult.place_name;
          }
        }
        if (mapboxResult) {
          let coords = CoordsFromMapbox(mapboxResult.geometry.coordinates);
          values.latitude = coords.latitude;
          values.longitude = coords.longitude;
        }

        if (!(address.street && address.city && address.country)) {
          console.error("getPlaceName", values.address);
          addToastError(t("required") + ": " + t("address"), 400);
          return;
        }
      }

      console.info(values);
      props.onSubmit(values);
    })();
  }

  function checkAddress(e: MouseEvent) {
    e.preventDefault();
    (async () => {
      if (openAddress) {
        if (!(address.street && address.city && address.country)) {
          addToastError(t("required") + ": " + t("address"), 400);
          setLoading(false);
          setOpenCheckAddress(false);
          return;
        }
        setOpenCheckAddress(true);
        setLoading(true);
        const formattedAddress = (
          address.street +
          " " +
          address.postal +
          " " +
          address.city +
          " " +
          address.province +
          " " +
          address.country
        ).replaceAll(" ", "%20");

        var mapboxResult = await firstMapboxAddressDetails(formattedAddress);

        setValue("address", mapboxResult?.place_name || "");
        setLoading(false);
        if (!(address.street && address.city && address.country)) {
          console.error("getPlaceName", values.address);
          addToastError(t("required") + ": " + t("address"), 500);
          setLoading(false);
          setOpenCheckAddress(false);
          return;
        }
      }
    })();
  }

  async function checkEmail(email: string) {
    if (!props.onEmailExist || !email) return;

    const response = await userCheckEmailExists(email);
    const exists = response.data;

    if (exists) props.onEmailExist(email);
  }

  return (
    <div className={props.classes}>
      <form
        onSubmit={onSubmit}
        className="relative space-y-2"
        id="address-form"
      >
        <TextForm
          type="text"
          autoComplete="name"
          label={t("fullName") + "*"}
          name="name"
          required
          min={3}
          value={values.name}
          onChange={(e) => setValue("name", e.target.value)}
        />

        <PhoneFormField
          required
          min={3}
          value={values.phone_number}
          onChange={(e) => setValue("phone_number", e)}
        />
        {!authUser ? (
          <TextForm
            label={t("email") + "*"}
            name="email"
            type="email"
            required
            min={2}
            value={values.email}
            onChange={(e) => setValue("email", e.target.value)}
            onBlur={(e) => checkEmail(e.target.value)}
          />
        ) : null}

        {props.onlyShowEditableAddress ? null : (
          <div className="">
            <address>{values.address}</address>
            <label className="btn btn-ghost">
              <span className="">{t("editAddress")}</span>

              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-secondary ms-3"
                checked={openAddress}
                onChange={(e) => setOpenAddress(e.target.checked)}
              />
            </label>
          </div>
        )}

        {openAddress ? (
          <div
            className={
              props.onlyShowEditableAddress ? "space-y-2" : "bg-white p-5 pt-2"
            }
          >
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
              label={t("province")}
              name="province"
              autoComplete="address-level1"
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
            <div>
              <button
                className="btn btn-primary mt-4"
                type="button"
                onClick={(e) => checkAddress(e)}
              >
                {t("checkAddress")}
              </button>
              {openCheckAddress ? (
                loading ? (
                  <div className="flex items-center justify-center h-36">
                    <div className="icon-loader animate-spin text-2xl py-12" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    <div className="order-1">{t("youEntered")}</div>
                    <div className="order-3 sm:order-2">{t("weFound")}</div>

                    <div className="flex flex-row justify-center sm:justify-start order-2 sm:order-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-secondary me-3 mt-1"
                        checked={useUserInput}
                        onChange={() => setUseUserInput(true)}
                      />
                      <div className="whitespace-pre-wrap">
                        {`${address.street}\n${address.postal} ${address.city} ${address.province}\n${address.country}`}
                      </div>
                    </div>
                    <div className="flex flex-row justify-center sm:justify-start order-4">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-secondary me-3 mt-1"
                        checked={!useUserInput}
                        onChange={() => setUseUserInput(false)}
                      />
                      <div className="whitespace-pre-wrap">
                        {values.address.replaceAll(", ", "\n")}
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="mb-4">
          <PopoverOnHover
            className="tooltip-left float-right"
            message={t("weWouldLikeToKnowThisEquallyRepresented")}
          />
          <SizesDropdown
            filteredCategory={Object.keys(categories)}
            selectedSizes={values.sizes || []}
            className="w-full"
            handleChange={(v) => setValue("sizes", v)}
          />
        </div>
        {props.showNewsletter ? (
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">
                {authUser
                  ? t("newsletterSubscription")
                  : t("subscribeToTheClothingLoopNewsletter")}
                {props.isNewsletterRequired ? "*" : ""}
              </span>
              <input
                type="checkbox"
                required={props.isNewsletterRequired}
                className="checkbox border-black"
                checked={values.newsletter}
                onChange={(e) => setValue("newsletter", e.target.checked)}
                name="newsletter"
              />
            </label>
          </div>
        ) : null}
        {props.showTosPrivacyPolicy ? (
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">
                <Trans
                  i18nKey="iAmNotAMinor<1>Tos</1>And<2>PrivacyPolicy</2>Star"
                  components={{
                    "1": (
                      <a
                        href={localizePath("/terms-of-use")}
                        target="_blank"
                        className="link"
                      ></a>
                    ),
                    "2": (
                      <a
                        href={localizePath("/privacy-policy")}
                        target="_blank"
                        className="link"
                      ></a>
                    ),
                  }}
                ></Trans>
              </span>
              <input
                type="checkbox"
                required
                className="checkbox border-black"
                name="privacyPolicy"
              />
            </label>
          </div>
        ) : null}
      </form>
    </div>
  );
}
