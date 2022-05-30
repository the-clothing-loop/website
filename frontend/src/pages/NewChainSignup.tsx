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
    name: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    email: Yup.string()
      .email("Please enter a valid e-mail address")
      .required("Required"),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: "Please enter valid phone number",
      })
      .max(15)
      .required("Please enter a valid phone number"),
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
              ? setError("Please enter a valid phone number")
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
                Starting a Loop is fun and easy!{" "}
              </Typography>
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {" "}
                In our manual you'll find all the steps to make your new swap
                empire run smoothly. Three more things to do:
              </Typography>

              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                First: register your Loop via this form
              </Typography>

              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
                style={{ marginTop: "5px" }}
              >
                Second: login via the link sent to your email
              </Typography>
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
                style={{ marginTop: "5px" }}
              >
                Third: send friends and neighbours to this website to subscribe,
                and wait for submissions to roll in!
              </Typography>

              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {" "}
                All the data of new participants can be accessed on your
                personal page.
              </Typography>
              <Typography
                component="p"
                className={classes.p}
                id="explanatory-text"
              >
                {" "}
                Happy swapping!
              </Typography>
              <Form className={classes.formGrid}>
                <TextForm
                  required
                  label="Name"
                  name="name"
                  type="text"
                  className={classes.textField}
                  error={touched.name && Boolean(errors.name)}
                  helperText={errors.name && touched.name ? errors.name : null}
                />

                <TextForm
                  required
                  label="Email"
                  name="email"
                  type="email"
                  className={classes.textField}
                  error={touched.email && Boolean(errors.email)}
                  helperText={
                    errors.email && touched.email ? errors.email : null
                  }
                />
                <PhoneFormField
                  label="Phone number"
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
