// React / plugins
import { useState, useEffect, FormEvent } from "react";
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

interface Params {
  chainUID: string;
}

interface RegisterUserForm {
  name: string;
  email: string;
  phoneNumber: string;
  newsletter: boolean;
  sizes: string[];
}

export default function Signup() {
  const history = useHistory();
  const { chainUID } = useParams<Params>();
  const [chain, setChain] = useState<Chain | null>(null);
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [geocoderResult, setGeocoderResult] = useState({
    result: { place_name: "" },
  });
  const [error, setError] = useState("");
  const [jsValues, setJsValues] = useState({
    phone: "",
    address: "",
    sizes: [] as string[],
  });

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
  function onSubmit(e: FormEvent<RegisterUserForm>) {
    const values = FormJup<RegisterUserForm>(e);

    (async () => {
      try {
        await registerBasicUser(
          {
            name: values.name,
            email: values.email,
            phone_number: jsValues.phone,
            address: geocoderResult.result.place_name,
            newsletter: values.newsletter === "true",
            sizes: jsValues.sizes,
          },
          chainUID
        );
        setSubmitted(true);
      } catch (e: any) {
        console.error(`Error creating user: ${JSON.stringify(e)}`);
        e.code === "auth/invalid-phone-number"
          ? setError(t("pleaseEnterAValid.phoneNumber"))
          : setError(e?.data || `Error: ${JSON.stringify(e)}`);
      }
    })();
  }

  const handleClickAction = (
    e: React.MouseEvent<HTMLElement>,
    setAction: any
  ) => {
    e.preventDefault();
    setAction(true);
  };

  if (submitted) {
    return <Redirect to={"/thankyou"} />;
  } else {
    return (
      <>
        <Helmet>
          <title>The Clothing Loop | Signup user</title>
          <meta name="description" content="Signup user" />
        </Helmet>

        <main className="">
          <TwoColumnLayout img="/images/Join-Loop.jpg">
            <div id="container" className="">
              <h1 className="font-serif font-bold text-4xl text-secondary">
                {t("join")}
                <span> {chain?.name}</span>
              </h1>

              <form>
                <TextForm label={t("name")} name="name" type="text" required />
                <TextForm
                  label={t("email")}
                  name="email"
                  type="email"
                  required
                />

                <PhoneFormField />

                <GeocoderSelector onResult={setGeocoderResult} />

                <div className="">
                  <SizesDropdown
                    filteredGenders={chain?.genders || []}
                    selectedSizes={jsValues.sizes}
                    handleChange={(s) =>
                      setJsValues((state) => ({ ...state, sizes: s }))
                    }
                  />
                  <PopoverOnHover
                    message={t("weWouldLikeToKnowThisEquallyRepresented")}
                  />
                </div>

                <FormActions />

                <div className="">
                  <button
                    type="submit"
                    className="btn btn-primary btn-outline"
                    onClick={() =>
                      history.push({
                        pathname: "/loops/find",
                        state: { detail: "something" },
                      })
                    }
                  >
                    {t("back")}
                  </button>
                  <button type="submit" className="btn btn-primary btn-outline">
                    {t("join")}
                    <span className="feather feather-arrow-right ml-4"></span>
                  </button>
                </div>
              </form>
              <div className="">
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
