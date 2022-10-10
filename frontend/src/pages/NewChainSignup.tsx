// React / plugins
import { useState, useContext } from "react";
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
import { createUser } from "../util/firebase/user";
import SizesDropdown from "../components/SizesDropdown";
import categories from "../util/categories";
import FormActions from "../components/formActions";

//media
import RightArrow from "../images/right-arrow-white.svg";

const Signup = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [submitted, setSubmitted] = useState(false);
  const [geocoderResult, setGeocoderResult] = useState({
    result: { place_name: "" },
  });
  const [userId, setUserId] = useState("");
  const classes = makeStyles(theme as any)();
  const { user } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  //Phone Number Validation Format with E.164
  const phoneRegExp =
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

  const validate = Yup.object({
    name: Yup.string().min(2, t("mustBeAtLeastChar")).required(t("required")),
    email: Yup.string()
      .email(t("pleaseEnterAValid.emailAddress"))
      .required(t("required")),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: t("pleaseEnterAValid.phoneNumber"),
      })
      .max(15)
      .required(t("pleaseEnterAValid.phoneNumber")),
    newsletter: Yup.boolean(),
  });

  if (submitted) {
    return <Redirect to={{ pathname: "/loops/new", state: { userId } }} />;
  }

  if (user) {
    return (
      <Redirect to={{ pathname: "/loops/new", state: { userId: user.uid } }} />
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
      <Formik
        initialValues={{
          name: "",
          email: "",
          phoneNumber: "",
          newsletter: false,
        }}
        validationSchema={validate}
        validateOnChange={false}
        onSubmit={async (values) => {
          const user = {
            address: geocoderResult.result.place_name,
            chainId: null,
            ...values,
            interestedSizes: [],
          };

          console.log(`creating user: ${JSON.stringify(user)}`);
          try {
            setUserId(await createUser(user));
            setSubmitted(true);
          } catch (e: any) {
            console.error(`Error creating user: ${JSON.stringify(e)}`);
            e.code === "auth/invalid-phone-number"
              ? setError(t("pleaseEnterAValid.phoneNumber"))
              : setError(e.message);
          }
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
                {t("startingALoopIsFunAndEasy")}
              </Typography>
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {t("inOurManualYoullFindAllTheStepsNewSwapEmpire")}
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
                  error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                  helperText={
                    errors.phoneNumber && touched.phoneNumber
                      ? errors.phoneNumber
                      : null
                  }
                  onChange={(e: string) =>
                    setFieldValue("phoneNumber", e.replace(/\s/g, ""))
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
