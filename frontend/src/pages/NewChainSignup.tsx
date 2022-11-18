import { useState, useContext, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

import ProgressBar from "../components/ProgressBar";
import { PhoneFormField, TextForm } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { AuthContext } from "../providers/AuthProvider";
import FormActions from "../components/formActions";
import { State as LoopsNewState } from "./NewChainLocation";
import { RequestRegisterUser } from "../api/login";
import FormJup from "../util/form-jup";

interface FormHtmlValues {
  name: string;
  email: string;
  phoneNumber: string;
  newsletter: string;
}
interface FormJsValues {
  address: string;
}

export default function Signup() {
  const { t } = useTranslation();
  const history = useHistory();
  const authUser = useContext(AuthContext).authUser;
  const [error, setError] = useState("");
  const [registerUser, setRegisterUser] = useState<RequestRegisterUser | null>(
    null
  );
  const [JsValues, setJsValues] = useState<FormJsValues>({
    address: "",
  });

  if (registerUser) {
    return (
      <Redirect
        to={{
          pathname: "/loops/new",
          state: {
            only_create_chain: false,
            register_user: registerUser,
          } as LoopsNewState,
        }}
      />
    );
  }

  if (authUser) {
    return (
      <Redirect
        to={{
          pathname: "/loops/new",
          state: { only_create_chain: true } as LoopsNewState,
        }}
      />
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const values = FormJup<FormHtmlValues>(e);

    (async () => {
      let registerUser: RequestRegisterUser = {
        name: values.name,
        email: values.email,
        phone_number: values.phoneNumber,
        address: JsValues.address,
        newsletter: values.newsletter === "true",
        sizes: [],
      };
      console.log("submit", registerUser);

      setRegisterUser(registerUser);
    })();
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Create user for new Loop</title>
        <meta name="description" content="Create user for new loop" />
      </Helmet>
      <main className="tw-max-w-screen-sm tw-mx-auto">
        <h3 className="tw-font-serif tw-font-bold tw-text-6xl tw-text-secondary">
          {t("startNewLoop")}
        </h3>

        <ProgressBar activeStep={0} />
        <p className="">{t("startingALoopIsFunAndEasy")}</p>
        <p className="">{t("inOurManualYoullFindAllTheStepsNewSwapEmpire")}</p>

        <p className="">{t("firstRegisterYourLoopViaThisForm")}</p>

        <p className="">{t("secondLoginViaLink")}</p>
        <p className="">{t("thirdSendFriendsToWebsite")}</p>

        <p className="">{t("allDataOfNewParticipantsCanBeAccessed")}</p>
        <p className="">{t("happySwapping")}</p>
        <form onSubmit={onSubmit}>
          <TextForm
            min={2}
            required
            label={t("name")}
            name="name"
            type="text"
          />

          <TextForm
            required
            min={2}
            label={t("email")}
            name="email"
            type="email"
          />
          <PhoneFormField />

          <GeocoderSelector
            onResult={(g) =>
              setJsValues((state) => ({
                ...state,
                address: g.result.place_name,
              }))
            }
          />
          <FormActions />

          <div className="tw-flex tw-justify-end">
            <button
              type="submit"
              className="tw-btn tw-btn-primary tw-btn-outline"
              onClick={() => history.push("/loops/find")}
            >
              {t("back")}
            </button>
            <button type="submit" className="tw-btn tw-btn-primary">
              {t("next")}
              <span className="feather feather-arrow-right tw-ml-4"></span>
            </button>
          </div>
        </form>
        <div className="">
          <p className="tw-text-sm">{t("troublesWithTheSignupContactUs")}</p>
          <a
            className="link"
            href="mailto:hello@clothingloop.org?subject=Troubles signing up to The Clothing Loop"
          >
            hello@clothingloop.org
          </a>
        </div>
      </main>
    </>
  );
}
