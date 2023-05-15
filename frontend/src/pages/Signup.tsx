// React / plugins
import { useState, useEffect, FormEvent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

import PopoverOnHover from "../components/Popover";
import { TwoColumnLayout } from "../components/Layouts";
import { Chain, User } from "../api/types";
import { chainAddUser, chainGet } from "../api/chain";
import { registerBasicUser } from "../api/login";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";
import { AuthContext } from "../providers/AuthProvider";
import { TFunction } from "i18next";
import AddressForm, { ValuesForm } from "../components/AddressForm";

interface Params {
  chainUID: string;
}

export default function Signup() {
  const history = useHistory();
  const { t } = useTranslation();
  const { addToastError, addModal } = useContext(ToastContext);
  const { authUser, authUserRefresh } = useContext(AuthContext);

  const { chainUID } = useParams<Params>();
  const [chain, setChain] = useState<Chain | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Get chain id from the URL and save to state
  useEffect(() => {
    (async () => {
      if (chainUID) {
        try {
          const chain = (await chainGet(chainUID)).data;
          setChain(chain);
        } catch (err) {
          console.error(`chain ${chainUID} does not exist`);
        }
      }
    })();
  }, [chainUID]);

  function onSubmitCurrentUser(values: ValuesForm) {
    console.info("submit", { ...values });
    if (authUser && chainUID) {
      chainAddUser(chainUID, authUser.uid, false)
        .then(() => {
          authUserRefresh();
        })
        .catch((err) => {
          addToastError(GinParseErrors(t, err), err?.status);
        });
    }
  }

  // Gather data from form, validate and send to firebase
  function onSubmitNewUser(values: ValuesForm) {
    let privacyPolicy = document.getElementsByName(
      "privacyPolicy"
    )[0] as HTMLInputElement;

    if (!privacyPolicy.checked) {
      addToastError(t("required") + " " + t("privacyPolicy"), 400);
      return;
    }
    (async () => {
      try {
        await registerBasicUser(
          {
            name: values.name,
            email: values.email,
            phone_number: values.phone,
            newsletter: values.newsletter,
            address: values.address,
            sizes: values.sizes,
          },
          chainUID
        );
        setSubmitted(true);
        if (window.goatcounter)
          window.goatcounter.count({
            path: "new-user",
            title: "New user",
            event: true,
          });
      } catch (err: any) {
        console.error("Error creating user:", err);

        if (err?.code === "auth/invalid-phone-number") {
          console.log("1");
          addToastError(t("pleaseEnterAValid.phoneNumber"), 400);
        } else if (err?.status === 409) {
          console.log("2");

          addModal({
            message: err.data,
            actions: [
              {
                text: t("login"),
                type: "default",
                fn: () => history.push("/users/login"),
              },
            ],
          });
        } else {
          console.log("3");
          addToastError(GinParseErrors(t, err), 400);
        }
      }
    })();
  }

  if (submitted) {
    return <Redirect to={"/thankyou"} />;
  } else {
    return (
      <>
        <Helmet>
          <title>The Clothing Loop | Signup user</title>
          <meta name="description" content="Signup user" />
        </Helmet>

        <main className="md:p-10">
          <TwoColumnLayout
            t={t}
            img="https://images.clothingloop.org/x600/join_loop.jpg"
            alt="Nichon giving a large bag of clothes to another woman"
            credit="Anke Teunissen"
          >
            <div>
              <h1 className="font-semibold text-3xl text-secondary mb-3">
                {t("join")}
                <span> {chain?.name}</span>
              </h1>

              {authUser ? (
                <div>
                  <AddressForm onSubmit={onSubmitCurrentUser} />
                  <div className="mb-4">
                    <button
                      type="button"
                      className="btn btn-secondary btn-outline mr-3"
                      onClick={() => history.goBack()}
                    >
                      {t("back")}
                    </button>
                    <SubmitButton t={t} chain={chain} user={authUser} />
                  </div>
                </div>
              ) : (
                <div>
                  <AddressForm
                    onSubmit={onSubmitNewUser}
                    requireNewsletter={false}
                  />
                  <PopoverOnHover
                    className="tooltip-right"
                    message={t("weWouldLikeToKnowThisEquallyRepresented")}
                  />

                  <div className="mb-4">
                    <button
                      type="button"
                      className="btn btn-secondary btn-outline mr-3"
                      onClick={() => history.goBack()}
                    >
                      {t("back")}
                    </button>
                    <SubmitButton t={t} chain={chain} />
                  </div>
                </div>
              )}
              <div className="text-sm">
                <p className="text">{t("troublesWithTheSignupContactUs")}</p>
                <a
                  className="link"
                  href="mailto:hello@clothingloop.org?subject=Troubles signing up to The Clothing Loop"
                >
                  hello@clothingloop.org
                </a>
              </div>
            </div>
          </TwoColumnLayout>
        </main>
      </>
    );
  }
}

function SubmitButton({
  t,
  chain,
  user,
}: {
  t: TFunction;
  chain: Chain | null;
  user?: User | null;
}) {
  if (chain?.open_to_new_members == false || chain?.published == false) {
    return (
      <p className="px-3 font-semibold text-sm border border-secondary h-12 inline-flex items-center text-secondary">
        {t("closed")}
        <span className="feather feather-lock ml-3 rtl:ml-0 rtl:mr-3"></span>
      </p>
    );
  }

  if (user && chain) {
    let userChain = user.chains.find((uc) => uc.chain_uid === chain.uid);
    if (userChain) {
      if (userChain.is_approved) {
        return (
          <p className="bg-primary px-3 font-semibold text-sm border border-primary h-12 inline-flex items-center">
            {t("joined")}
            <span className="feather feather-check ml-3 rtl:ml-0 rtl:mr-3"></span>
          </p>
        );
      } else {
        return (
          <p className="px-3 font-semibold text-sm border border-secondary h-12 inline-flex items-center text-secondary">
            {t("pendingApproval")}
            <span className="feather feather-user-check ml-3 rtl:ml-0 rtl:mr-3"></span>
          </p>
        );
      }
    }
  }

  return (
    <button type="submit" className="btn btn-primary" form="address-form">
      {t("join")}
      <span className="feather feather-arrow-right ml-4 rtl:hidden"></span>
      <span className="feather feather-arrow-left mr-4 ltr:hidden"></span>
    </button>
  );
}
