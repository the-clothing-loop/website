// React / plugins
import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";

// Material UI
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import ThreeColumnLayout from "../components/ThreeColumnLayout";
import { Alert } from "@material-ui/lab";

// Project resources
import {
  PhoneFormField,
  TextForm,
  CheckboxField,
} from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { AuthContext } from "../components/AuthProvider";
import AppIcon from "../images/clothing-loop.png";
import { createUser } from "../util/firebase/user";

const Signup = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [geocoderResult, setGeocoderResult] = useState({
    result: { place_name: "" },
  });
  const [userId, setUserId] = useState("");
  const classes = makeStyles(theme as any)();
  const { user } = useContext(AuthContext);
  const [error, setError] = useState("");

  //Phone Number Validation Format with E.164
  const phoneRegExp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

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
    actionsNewsletter: Yup.boolean(),
    dataConsent: Yup.boolean(),
  });

  if (submitted) {
    return <Redirect to={`/chains/new-location/${userId}`} />;
  }

  if (user) {
    return <Redirect to={`/chains/new-location/${user.uid}`} />;
  }

  return <>
    <Helmet>
      <title>Clothing-Loop | Create user for new loop</title>
      <meta name="description" content="Create user for new loop"/>
    </Helmet>
    <Formik
      initialValues={{
        name: "",
        email: "",
        phoneNumber: "",
        newsletter: false,
        actionsNewsletter: false,
        dataConsent: false,
      }}
      validationSchema={validate}
      onSubmit={async (values) => {
        const user = {
          address: geocoderResult.result.place_name,
          chainId: null,
          ...values,
        };

        console.log(`creating user: ${JSON.stringify(user)}`);
        try {
          setUserId(await createUser(user));
          setSubmitted(true);
        } catch (e) {
          console.error(`Error creating user: ${JSON.stringify(e)}`);
          setError(e.message);
        }
      }}
    >
      {({ errors, touched, setFieldValue }) => (
        <ThreeColumnLayout>
          <div>
            <img
              src={AppIcon}
              alt="SFM logo"
              width="500"
              className={classes.image}
            />
            <Typography variant="h3" className={classes.pageTitle}>
              {t("signup")}
            </Typography>{" "}
            <Form>
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
                helperText={errors.email && touched.email ? errors.email : null}
              />
              <PhoneFormField
                label="Phone number"
                name="phoneNumber"
                error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                onChange={(e: string) =>
                  setFieldValue("phoneNumber", e.replace(/\s/g, ""))
                }
              />

              <GeocoderSelector name="address" onResult={setGeocoderResult} />

              <CheckboxField
                label="Newsletter"
                name="newsletter"
                type="checkbox"
              />
              <CheckboxField
                label="Actions newsletter"
                name="actionsNewsletter"
                type="checkbox"
              />
              <CheckboxField
                label="Data use consent"
                name="dataConsent"
                type="checkbox"
                req={true}
              />
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                {t("signup")}
              </Button>
            </Form>
          </div>
        </ThreeColumnLayout>
      )}
    </Formik>
  </>
};

export default Signup;
