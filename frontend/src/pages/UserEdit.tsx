import { useState, useEffect, useMemo, FormEvent } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import SizesDropdown from "../components/SizesDropdown";
import categories from "../util/categories";
import GeocoderSelector from "../components/GeocoderSelector";
import { UID, User } from "../api/types";
import { userGetByUID, userUpdate } from "../api/user";
import FormJup from "../util/form-jup";
import { PhoneFormField } from "../components/FormFields";

interface Params {
  userUID: UID;
}

interface State {
  chainUID: UID;
}

interface FormValues {
  name: string;
  phoneNumber: string;
  newsletter: boolean;
  sizes: string[];
}

export default function UserEdit() {
  const { t } = useTranslation();
  const history = useHistory();
  const state = useLocation<State>().state;

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [jsFields, setJsFields] = useState({
    phone: "",
    address: "",
    sizes: [] as string[],
  });

  const [user, setUser] = useState<User>();
  const params = useParams<Params>();

  const userIsChainAdmin = useMemo(
    () =>
      user?.chains.find((c) => c.chain_uid == state.chainUID)?.is_chain_admin ||
      false,
    [user]
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const values = FormJup<FormValues>(e);

    (async () => {
      try {
        await userUpdate({
          name: values.name,
          phone_number: values.phoneNumber,
          newsletter: values.newsletter == "true",
          address: jsFields.address,
          sizes: jsFields.sizes,
        });
        setSubmitted(true);
        setTimeout(() => {
          history.goBack();
        }, 1200);
      } catch (e: any) {
        console.error(`Error updating user: ${JSON.stringify(e)}`);
        setError(e?.data || `Error: ${JSON.stringify(e)}`);
      }
    })();
  }

  useEffect(() => {
    (async () => {
      try {
        const user = (await userGetByUID(state.chainUID, params.userUID)).data;
        setUser(user);
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [history]);

  return !user ? null : (
    <>
      <Helmet>
        <title>The Clothing Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
      <div className="tw-w-full sm:tw-w-screen-sm tw-mx-auto tw-p-10">
        <h1 className="tw-font-serif tw-font-bold tw-text-6xl">
          {user.is_root_admin || userIsChainAdmin
            ? t("editAdminContacts")
            : t("editParticipantContacts")}
        </h1>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder={t("name")}
            name="name"
            className="tw-input"
            required
            min={2}
          />

          <PhoneFormField />

          <SizesDropdown
            filteredGenders={Object.keys(categories)}
            selectedSizes={jsFields.sizes || []}
            handleChange={(v) =>
              setJsFields((state) => ({ ...state, sizes: v }))
            }
          />

          <GeocoderSelector
            address={jsFields.address}
            onResult={(e) => {
              setJsFields((state) => ({
                ...state,
                address: e.result.place_name,
              }));
            }}
          />

          <div className="tw-form-control">
            <label className="tw-label tw-cursor-pointer">
              <span className="tw-label-text">
                {t("newsletterSubscription")}
              </span>
              <input
                type="checkbox"
                className="tw-checkbox"
                name="newsletter"
              />
            </label>
          </div>

          <div className="tw-flex">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="tw-btn tw-btn-primary tw-btn-outline"
            >
              {t("back")}
            </button>

            <button type="submit" className="tw-btn tw-btn-secondary tw-ml-3">
              {t("submit")}
              <span className="feather feather-arrow-right tw-ml-4"></span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
