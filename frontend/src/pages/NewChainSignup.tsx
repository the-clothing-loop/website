import { useState, useContext, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

import ProgressBar from "../components/ProgressBar";
import { PhoneFormField, TextForm } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { AuthContext } from "../providers/AuthProvider";
import FormActions from "../components/formActions";
import { State as LoopsNewState } from "./NewChainLocation";
import { RequestRegisterUser } from "../api/login";
import FormJup from "../util/form-jup";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";

interface FormHtmlValues {
  name: string;
  email: string;
  phone: string;
  newsletter: string;
}
interface FormJsValues {
  address: string;
}

export default function Signup() {
  const { t } = useTranslation();
  const history = useHistory();
  const authUser = useContext(AuthContext).authUser;
  const { addToastError } = useContext(ToastContext);
  const [jsValues, setJsValue, setJsValues] = useForm<FormJsValues>({
    address: "",
  });

  if (authUser) {
    history.replace({
      pathname: "/loops/new",
      state: { only_create_chain: true } as LoopsNewState,
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const values = FormJup<FormHtmlValues>(e);
    console.info("submit", { ...values, ...jsValues });

    if (jsValues.address.length < 6) {
      addToastError(t("required") + ": " + t("address"));
      return;
    }

    let registerUser: RequestRegisterUser = {
      name: values.name,
      email: values.email,
      phone_number: values.phone,
      address: jsValues.address,
      newsletter: values.newsletter === "true",
      sizes: [],
    };
    console.log("submit", registerUser);

    if (registerUser) {
      history.push({
        pathname: "/loops/new",
        state: {
          only_create_chain: false,
          register_user: registerUser,
        } as LoopsNewState,
      });
    }
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Create user for new Loop</title>
        <meta name="description" content="Create user for new loop" />
      </Helmet>
      <main className="container lg:max-w-screen-lg mx-auto md:px-20 pt-4">
        <div className="bg-teal-light p-8">
          <h1 className="text-center font-medium text-secondary text-5xl mb-6">
            {t("startNewLoop")}
          </h1>

          <div className="text-center mb-6">
            <ProgressBar activeStep={0} />
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 md:pr-4">
              <div className="prose">
                <p>{t("startingALoopIsFunAndEasy")}</p>
                <p>{t("inOurManualYoullFindAllTheStepsNewSwapEmpire")}</p>

                <p>{t("firstRegisterYourLoopViaThisForm")}</p>

                <p>{t("secondLoginViaLink")}</p>
                <p>{t("thirdSendFriendsToWebsite")}</p>

                <p>{t("allDataOfNewParticipantsCanBeAccessed")}</p>
                <p>{t("happySwapping")}</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 md:pl-4">
              <form onSubmit={onSubmit}>
                <TextForm
                  min={2}
                  required
                  label={t("name") + "*"}
                  name="name"
                  type="text"
                />

                <TextForm
                  required
                  min={2}
                  label={t("email") + "*"}
                  name="email"
                  type="email"
                />
                <PhoneFormField required />

                <label className="form-control w-full mb-4">
                  <div className="label">
                    <span className="label-text">{t("address") + "*"}</span>
                  </div>
                  <GeocoderSelector
                    required
                    onResult={(g) => setJsValue("address", g.query)}
                  />
                </label>
                <FormActions isNewsletterRequired={true} />

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary">
                    {t("next")}
                    <span className="feather feather-arrow-right ml-4"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="text-sm text-center mt-4 text-black/80">
            <p>{t("troublesWithTheSignupContactUs")}</p>
            <a
              className="link"
              href="mailto:hello@clothingloop.org?subject=Troubles signing up to The Clothing Loop"
            >
              hello@clothingloop.org
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
