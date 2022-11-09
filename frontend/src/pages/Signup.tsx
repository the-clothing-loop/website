// React / plugins
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import GeocoderSelector from "../components/GeocoderSelector";
import SizesDropdown from "../components/SizesDropdown";
import PopoverOnHover from "../components/Popover";

import { Alert, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import { TwoColumnLayout } from "../components/Layouts";

// Project resources
import { PhoneFormField, TextForm } from "../components/FormFields";
import FormActions from "../components/formActions";

//Media
import { Chain } from "../api/types";
import { chainGet } from "../api/chain";
import { registerBasicUser, RequestRegisterUser } from "../api/login";
import { Sizes } from "../api/enums";
import { phoneRegExp } from "../util/phoneRegExp";

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

const Signup = () => {
  const history = useHistory();
  const { chainUID } = useParams<Params>();
  const [chain, setChain] = useState<Chain | null>(null);
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [geocoderResult, setGeocoderResult] = useState({
    result: { place_name: "" },
  });
  const [error, setError] = useState("");
  const classes = makeStyles(theme as any)();

  const validate = Yup.object({
    name: Yup.string().min(2, t("mustBeAtLeastChar")).required(t("required")),
    email: Yup.string().email(t("pleaseEnterAValid.emailAddress")),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: t("pleaseEnterAValid.phoneNumber"),
      })
      .required(t("required")),
    sizes: Yup.array().of(Yup.string()).required(t("required")),
    newsletter: Yup.boolean(),
  } as Record<keyof RegisterUserForm, any>);

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
  const onSubmit = async (formData: RegisterUserForm) => {
    // TODO: allow only full addresses

    try {
      await registerBasicUser(
        {
          name: formData.name,
          email: formData.email,
          phone_number: formData.phoneNumber,
          address: geocoderResult.result.place_name,
          newsletter: formData.newsletter,
          sizes: formData.sizes,
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
  };

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
        <Formik<RegisterUserForm>
          initialValues={{
            name: "",
            email: "",
            phoneNumber: "",
            newsletter: false,
            sizes: [],
          }}
          validationSchema={validate}
          validateOnChange={false}
          onSubmit={(v) => onSubmit(v)}
        >
          {(formik) => (
            <div className="signup-wrapper">
              <TwoColumnLayout img="/images/Join-Loop.jpg">
                <div id="container" className="signup-content">
                  <h3 className={classes.pageTitle}>
                    {t("join")}
                    <span> {chain?.name}</span>
                  </h3>

                  <Form className={classes.formGrid}>
                    <TextForm
                      label={t("name")}
                      name="name"
                      type="text"
                      required
                      className={classes.textField}
                    />
                    <TextForm
                      label={t("email")}
                      name="email"
                      type="email"
                      required
                      className={classes.textField}
                    />

                    <PhoneFormField
                      label={t("phoneNumber")}
                      name="phoneNumber"
                      onChange={(e) => {
                        formik.setFieldValue("phoneNumber", e as string);
                      }}
                    />

                    <GeocoderSelector
                      name="address"
                      onResult={setGeocoderResult}
                    />

                    <div className={classes.formFieldWithPopover}>
                      <SizesDropdown
                        filteredGenders={chain?.genders || []}
                        selectedSizes={formik.values.sizes}
                        handleChange={(s) => formik.setFieldValue("sizes", s)}
                      />
                      <PopoverOnHover
                        message={t("weWouldLikeToKnowThisEquallyRepresented")}
                      />
                    </div>

                    <FormActions handleClick={handleClickAction} />

                    {error && <Alert severity="error">{error}</Alert>}
                    <div className={classes.formSubmitActions}>
                      <button
                        type="submit"
                        className="tw-btn tw-btn-primary tw-btn-outline"
                        onClick={() =>
                          history.push({
                            pathname: "/loops/find",
                            state: { detail: "something" },
                          })
                        }
                      >
                        {t("back")}
                      </button>
                      <button
                        type="submit"
                        className="tw-btn tw-btn-primary tw-btn-outline"
                      >
                        {t("join")}
                        <span className="feather feather-arrow-right tw-ml-4"></span>
                      </button>
                    </div>
                  </Form>
                  <div className={classes.formHelperLink}>
                    <p className="text">
                      {t("troublesWithTheSignupContactUs")}
                    </p>
                    <a
                      className="link"
                      href="mailto:hello@clothingloop.org?subject=Troubles signing up to The Clothing Loop"
                    >
                      hello@clothingloop.org
                    </a>
                  </div>
                </div>
              </TwoColumnLayout>
            </div>
          )}
        </Formik>
      </>
    );
  }
};

export default Signup;
