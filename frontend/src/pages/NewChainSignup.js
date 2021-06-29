// React / plugins
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Material UI
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles, TextField } from "@material-ui/core";
import theme from "../util/theme";
import ThreeColumnLayout from "../components/ThreeColumnLayout";
import { useHistory } from "react-router-dom";

// Project resources
import {
  TextFormField,
  PhoneFormField,
  TextForm,
  CheckboxField,
} from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import AppIcon from "../images/sfm_logo.png";
import { boolean } from "yup/lib/locale";

const Signup = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [geocoderResult, setGeocoderResult] = useState({});
  const history = useHistory();
  const classes = makeStyles(theme)();

  const phoneRegExp = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

  const validate = Yup.object({
    name: Yup.string()
      .min(2, "Must be 15 characters or less")
      .required("Required"),

    email: Yup.string().email("Please enter a valid e-mail address"),
    phoneNumber: Yup.string()
      //TODO check phone validation
      .matches(phoneRegExp, "Phone number is not valid")
      .required("Required"),
    newsletter: Yup.boolean(),
    actions: Yup.boolean(),
  });

  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        phoneNumber: "",
        newsletter: false,
        actions: false,
      }}
      validationSchema={validate}
      onSubmit={(values) => {
        values.address = geocoderResult.result.place_name;
        //TODO do something on submit - post data to Firebase
        //check if user is already on db and redirect to relevant page

        history.push("/newchain-location");
      }}
    >
      {(formik) => (
        <ThreeColumnLayout>
          <div>
            <img
              src={AppIcon}
              alt="SFM logo"
              width="200"
              className={classes.image}
            />
            <Typography variant="h3" className={classes.pageTitle}>
              {t("signup")}
            </Typography>{" "}
            <Form>
              <TextForm
                label="Name"
                name="name"
                type="text"
                className={classes.textField}
              />

              <TextForm
                label="Email"
                name="email"
                type="email"
                className={classes.textField}
              />
              <PhoneFormField
                label="Phone number"
                name="phoneNumber"
                onChange={(e) => formik.setFieldValue("phoneNumber", e)}
              />
              <GeocoderSelector name="address" onResult={setGeocoderResult} />

              <CheckboxField
                label="Newsletter"
                name="newsletter"
                type="checkbox"
              />
              <CheckboxField label="Actions" name="actions" type="checkbox" />
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
  );
};

export default Signup;
