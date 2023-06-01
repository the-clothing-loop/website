import { useEffect, FormEvent, useContext, useState, MouseEvent } from "react";
import { Trans, useTranslation } from "react-i18next";

import SizesDropdown from "./SizesDropdown";
import { TextForm } from "./FormFields";
import categories from "../util/categories";

import { PhoneFormField } from "./FormFields";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";
import PopoverOnHover from "./Popover";
import { userGetByUID, userHasNewsletter } from "../api/user";

import { AuthContext } from "../providers/AuthProvider";

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
  userUID: string | undefined;
  chainUID?: string;
  classes?: string;
  isNewsletterRequired?: boolean;
  showTosPrivacyPolicy?: boolean;
  showNewsletter?: boolean;
  onlyShowEditableAddress?: boolean;
}) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);
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
  const [openAddress, setOpenAddress] = useState(
    () => !!props.onlyShowEditableAddress
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
            userGetByUID(props.chainUID, props!.userUID!),
            userHasNewsletter(props.chainUID, props.userUID!),
          ]);
          const user = userReq.data;
          setValues({
            name: user.name,
            phone: user.phone_number,
            email: user.email,
            sizes: user.sizes,
            address: user.address,
            newsletter: hasNewsletterReq.data,
          });
        } catch (error) {
          console.warn(error);
        }
      })();
    }
  }, [history]);

  async function getPlaceName(address: string): Promise<string> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${MAPBOX_TOKEN}&types=address`
    );
    const data = await response.json();
    // var longLat = (data.features[0]?.center);
    return data.features[0]?.place_name || "";
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    (async () => {
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
        if (useUserInput) {
          values.address = addressConcatenated;
        } else {
          const formattedAddress = addressConcatenated.replaceAll(" ", "%20");
          values.address = await getPlaceName(formattedAddress);
        }

        if (!(address.street && address.city && address.country)) {
          console.error("getPlaceName", values.address);
          addToastError(t("required") + ": " + t("address"), 400);
          return;
        }
      }
      console.log(values);
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

        var validatedAddress = await getPlaceName(formattedAddress);

        setValue("address", validatedAddress);
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

  return (
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
        <div>{t("address")}</div>
        {props.onlyShowEditableAddress ? null : (
          <div className="">
            <address>{values.address}</address>
            <label className="btn btn-ghost">
              <span className="">{t("edit")}</span>

              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-secondary ltr:ml-3 rtl:mr-3"
                checked={openAddress}
                onChange={(e) => setOpenAddress(e.target.checked)}
              />
            </label>
          </div>
        )}

        {openAddress ? (
          <div
            className={props.onlyShowEditableAddress ? "" : "bg-white p-5 pt-2"}
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
                    <div className="feather feather-loader animate-spin text-2xl py-12" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    <div className="order-1">{t("youEntered")}</div>
                    <div className="order-3 sm:order-2">{t("weFound")}</div>

                    <div className="flex flex-row justify-center sm:justify-start order-2 sm:order-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-secondary ltr:mr-3 rtl:ml-3 mt-1"
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
                        className="checkbox checkbox-sm checkbox-secondary ltr:mr-3 rtl:ml-3 mt-1"
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
            filteredGenders={Object.keys(categories)}
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
                        href="/terms-of-use"
                        target="_blank"
                        className="link"
                      ></a>
                    ),
                    "2": (
                      <a
                        href="/privacy-policy"
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
