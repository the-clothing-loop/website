// React / plugins
import { useState, useEffect, FormEvent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

import GeocoderSelector from "../components/GeocoderSelector";
import SizesDropdown from "../components/SizesDropdown";
import PopoverOnHover from "../components/Popover";
import { TwoColumnLayout } from "../components/Layouts";
import { PhoneFormField, TextForm } from "../components/FormFields";
import FormActions from "../components/formActions";
import { Chain } from "../api/types";
import { chainGet } from "../api/chain";
import { registerBasicUser } from "../api/login";
import FormJup from "../util/form-jup";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";
import useForm from "../util/form.hooks";

interface Params {
  chainUID: string;
}

interface RegisterUserForm {
  name: string;
  email: string;
  phone: string;
  sizes: string[];
  privacyPolicy: boolean;
  newsletter: boolean;
}

export default function Signup() {
  const history = useHistory();
  const { chainUID } = useParams<Params>();
  const [chain, setChain] = useState<Chain | null>(null);
  const { t } = useTranslation();
  const { addToastError, addToastStatic } = useContext(ToastContext);
  const [submitted, setSubmitted] = useState(false);
  const [jsValues, setJsValue] = useForm({
    address: "",
    sizes: [] as string[],
  });
  const newsLetterRequired = false;

  // Get chain id from the URL and save to state
  useEffect(() => {
    (async () => {
      if (chainUID) {
        try {
          const chain = (await chainGet(chainUID)).data;
          setChain(chain);
        } catch (e) {
          console.error(`chain ${chainUID} does not exist`);
        }
      }
    })();
  }, [chainUID]);

  // Gather data from form, validate and send to firebase
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = FormJup<RegisterUserForm>(e);

    if (values.privacyPolicy !== "on") {
      addToastError(t("required") + " " + t("privacyPolicy"));
      return;
    }

    (async () => {
      try {
        await registerBasicUser(
          {
            name: values.name,
            email: values.email,
            phone_number: values.phone,
            address: jsValues.address,
            newsletter: values.newsletter === "on",
            sizes: jsValues.sizes,
          },
          chainUID
        );
        setSubmitted(true);
      } catch (err: any) {
        console.error("Error creating user:", err);

        if (err?.code === "auth/invalid-phone-number") {
          console.log("1");
          addToastError(t("pleaseEnterAValid.phoneNumber"));
        } else if (err?.status === 409) {
          console.log("2");

          addToastStatic({
            type: "info",
            message: err.data,
            actions: [
              {
                text: t("login"),
                type: "primary",
                fn: () => history.push("/users/login"),
              },
            ],
          });
        } else {
          console.log("3");
          addToastError(GinParseErrors(t, err));
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
          <TwoColumnLayout img="https://ucarecdn.com/1cd88d9e-e408-4582-bf4a-7849a65aae3c/-/resize/x600/-/format/auto/-/quality/smart/join_loop.jpg">
            <div id="container">
              <h1 className="font-semibold text-3xl text-secondary mb-3">
                {t("join")}
                <span> {chain?.name}</span>
              </h1>

              <form onSubmit={onSubmit} className="max-w-xs">
                <TextForm
                  label={t("name") + "*"}
                  name="name"
                  type="text"
                  required
                />
                <TextForm
                  label={t("email") + "*"}
                  name="email"
                  type="email"
                  required
                />

                <PhoneFormField required />

                <div className="mb-6">
                  <div className="form-control w-full mb-4">
                    <label className="label">
                      <span className="label-text">{t("address") + "*"}</span>
                    </label>
                    <GeocoderSelector
                      onResult={(e) => setJsValue("address", e.query)}
                    />
                  </div>
                  <SizesDropdown
                    className="md:dropdown-left md:[&_.dropdown-content]:-top-80"
                    filteredGenders={chain?.genders || []}
                    selectedSizes={jsValues.sizes}
                    handleChange={(s) => setJsValue("sizes", s)}
                  />
                  <PopoverOnHover
                    message={t("weWouldLikeToKnowThisEquallyRepresented")}
                  />
                  <FormActions isNewsLetterRequired={newsLetterRequired} />
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-outline mr-3"
                    onClick={() => history.goBack()}
                  >
                    {t("back")}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {t("join")}
                    <span className="feather feather-arrow-right ml-4"></span>
                  </button>
                </div>
              </form>
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
