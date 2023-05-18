import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

import ProgressBar from "../components/ProgressBar";
import { AuthContext } from "../providers/AuthProvider";
import { State as LoopsNewState } from "./NewChainLocation";
import { RequestRegisterUser } from "../api/login";
import { ToastContext } from "../providers/ToastProvider";
import AddressForm, { ValuesForm } from "../components/AddressForm";

export default function Signup() {
  const { t } = useTranslation();
  const history = useHistory();
  const authUser = useContext(AuthContext).authUser;
  const { addToastError } = useContext(ToastContext);

  if (authUser) {
    history.replace({
      pathname: "/loops/new",
      state: { only_create_chain: true } as LoopsNewState,
    });
  }

  function onSubmit(values: ValuesForm) {
    console.info("submit", { ...values });

    if (values.address.length < 6) {
      addToastError(t("required") + ": " + t("address"), 400);
      return;
    }

    let registerUser: RequestRegisterUser = {
      name: values.name,
      email: values.email,
      phone_number: values.phone,
      newsletter: values.newsletter,
      address: values.address,
      sizes: values.sizes,
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
              <AddressForm
                userUID={authUser?.uid || undefined}
                onSubmit={onSubmit}
                isNewsletterRequired={true}
                showNewsletter
                showTosPrivacyPolicy
                onlyShowEditableAddress={!authUser}
              />
              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  form="address-form"
                >
                  {t("next")}
                  <span className="feather feather-arrow-right ml-4 rtl:hidden"></span>
                  <span className="feather feather-arrow-left mr-4 ltr:hidden"></span>
                </button>
              </div>
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
