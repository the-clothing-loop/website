import ProgressBar from "../components/ProgressBar";

import type { RequestRegisterUser } from "../../../api/login";
import AddressForm, { type ValuesForm } from "../components/AddressForm";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { $authUser } from "../../../stores/auth";
import { addModal, addToastError } from "../../../stores/toast";
import useLocalizePath from "../util/localize_path.hooks";

export default function Signup() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  const authUser = useStore($authUser);

  if (authUser) {
    window.location.href = localizePath("/loops/new/?only_create_chain=true");
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
      phone_number: values.phone_number,
      newsletter: values.newsletter,
      address: values.address,
      sizes: values.sizes,
      latitude: values.latitude || 0,
      longitude: values.longitude || 0,
    };
    console.info("submit", registerUser);

    if (registerUser) {
      window.location.href = localizePath(
        "/loops/new/?register_user=" + encodeURI(JSON.stringify(registerUser)),
      );
    }
  }

  function onEmailExist(email: string) {
    console.log("Email already exists", email);
    addModal({
      message: t("userExists"),
      actions: [
        {
          text: t("login"),
          type: "default",
          fn: () => {
            let url = `/users/login/?email=${email}`;
            window.location.href = url;
          },
        },
      ],
    });
  }

  return (
    <>
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
                onEmailExist={onEmailExist}
                onlyShowEditableAddress={!authUser}
              />
              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  form="address-form"
                >
                  {t("next")}
                  <span className="icon-arrow-right ml-4 rtl:hidden"></span>
                  <span className="icon-arrow-left mr-4 ltr:hidden"></span>
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
