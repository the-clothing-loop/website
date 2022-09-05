// React / plugins
import { useState, useContext, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Redirect, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

import { Typography, Button, Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import { OneColumnLayout } from "../components/Layouts";
import ProgressBar from "../components/ProgressBar";
import PopoverOnHover from "../components/Popover";

// Project resources
import { PhoneFormField, TextForm } from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { AuthContext } from "../components/AuthProvider";
import FormActions from "../components/formActions";
import { State as LoopsNewState } from "./NewChainLocation";

//media
import RightArrow from "../images/right-arrow-white.svg";
import { RequestRegisterUser } from "../api/login";

type RegisterUserForm = Omit<RequestRegisterUser, "address" | "sizes">;

const Signup = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [geocoderResult, setGeocoderResult] = useState({
    result: { place_name: "" },
  });
  const classes = makeStyles(theme as any)();
  const authUser = useContext(AuthContext).authUser;
  const [registerUser, setRegisterUser] = useState<RequestRegisterUser | null>(
    null
  );
  const [error, setError] = useState("");

  //Phone Number Validation Format with E.164
  const phoneRegExp =
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

  const validate = Yup.object({
    name: Yup.string().min(2, t("mustBeAtLeastChar")).required(t("required")),
    email: Yup.string()
      .email(t("pleaseEnterAValid.emailAddress"))
      .required(t("required")),
    phone_number: Yup.string()
      .matches(phoneRegExp, {
        message: t("pleaseEnterAValid.phoneNumber"),
      })
      .max(15)
      .required(t("pleaseEnterAValid.phoneNumber")),
    address: Yup.string().default(""),
  } as Record<keyof RegisterUserForm, any>);

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

  const handleClickAction = (
    e: React.MouseEvent<HTMLElement>,
    setAction: any
  ) => {
    e.preventDefault();
    setAction(true);
  };

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Create user for new Loop</title>
        <meta name="description" content="Create user for new loop" />
      </Helmet>
      <Formik<RegisterUserForm>
        initialValues={{
          name: "",
          email: "",
          phone_number: "",
        }}
        validationSchema={validate}
        validateOnChange={false}
        onSubmit={async (values) => {
          let registerUser: RequestRegisterUser = {
            address: geocoderResult.result.place_name,
            ...values,
            sizes: [],
          };

          setRegisterUser(registerUser);
        }}
      >
        {({ errors, touched, setFieldValue }) => (
          <OneColumnLayout>
            <div className={classes.formWrapper}>
              <Typography
                variant="h3"
                className={classes.pageTitle}
                id="signup-title"
              >
                {t("startNewLoop")}
              </Typography>

              <ProgressBar activeStep={0} />
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                Starting a Loop is fun and easy!{" "}
              </Typography>
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {" " + t("inOurManualYoullFindAllTheStepsNewSwapEmpire")}
              </Typography>

              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {t("firstRegisterYourLoopViaThisForm")}
              </Typography>

              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
                style={{ marginTop: "5px" }}
              >
                {t("secondLoginViaLink")}
              </Typography>
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
                style={{ marginTop: "5px" }}
              >
                {t("thirdSendFriendsToWebsite")}
              </Typography>

              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {" " + t("allDataOfNewParticipantsCanBeAccessed")}
              </Typography>
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {" " + t("happySwapping")}
              </Typography>
              <Form className={classes.formGrid}>
                <TextForm
                  required
                  label={t("name")}
                  name="name"
                  type="text"
                  className={classes.textField}
                  error={touched.name && Boolean(errors.name)}
                  helperText={errors.name && touched.name ? errors.name : null}
                />

                <TextForm
                  required
                  label={t("email")}
                  name="email"
                  type="email"
                  className={classes.textField}
                  error={touched.email && Boolean(errors.email)}
                  helperText={
                    errors.email && touched.email ? errors.email : null
                  }
                />
                <PhoneFormField
                  label={t("phoneNumber")}
                  name="phoneNumber"
                  error={touched.phone_number && Boolean(errors.phone_number)}
                  helperText={
                    errors.phone_number && touched.phone_number
                      ? errors.phone_number
                      : null
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "phoneNumber",
                      (e as string).replace(/\s/g, "")
                    )
                  }
                />

                <GeocoderSelector name="address" onResult={setGeocoderResult} />
                <FormActions handleClick={handleClickAction} />

                {console.log(error)}

                {error ? <Alert severity="error">{error}</Alert> : null}
                <div className={classes.formSubmitActions}>
                  <Button
                    type="submit"
                    className={classes.buttonOutlined}
                    onClick={() => history.push("/loops/find")}
                  >
                    {" "}
                    {t("back")}
                  </Button>
                  <Button type="submit" className={classes.button}>
                    {t("next")}
                    <img src={RightArrow} alt="" />
                  </Button>
                </div>
              </Form>
              <div className={classes.formHelperLink}>
                <Typography component="p" className="text">
                  {t("troublesWithTheSignupContactUs")}
                </Typography>
                <a
                  className="link"
                  href="mailto:hello@clothingloop.org?subject=Troubles signing up to The Clothing Loop"
                >
                  hello@clothingloop.org
                </a>
              </div>
            </div>
          </OneColumnLayout>
        )}
      </Formik>
    </>
  );
};

export default Signup;
