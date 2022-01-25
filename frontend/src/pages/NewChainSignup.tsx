// React / plugins
import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Redirect, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

// Material UI
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import { OneColumnLayout } from "../components/Layouts";
import { Alert } from "@material-ui/lab";
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
    return <Redirect to={`/loops/new-location/${userId}`} />;
  }

  if (user) {
    return <Redirect to={`/loops/new-location/${user.uid}`} />;
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
        <title>Clothing-Loop | Create user for new loop</title>
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
        onSubmit={async (values) => {
          const user = {
            address: geocoderResult.result.place_name,
            chainId: null,
            ...values,
            interestedSizes: selectedSizes,
          };

          console.log(`creating user: ${JSON.stringify(user)}`);
          try {
            setUserId(await createUser(user));
            setSubmitted(true);
          } catch (e: any) {
            console.error(`Error creating user: ${JSON.stringify(e)}`);
            setError(e.message);
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
                  onChange={(e: string) =>
                    setFieldValue("phoneNumber", e.replace(/\s/g, ""))
                  }
                />

                <GeocoderSelector name="address" onResult={setGeocoderResult} />

                <div className={classes.formFieldWithPopover}>
                  <SizesDropdown
                    className={classes.formSelect}
                    setSizes={setSelectedSizes}
                    genders={Object.keys(categories)}
                    sizes={selectedSizes}
                    label={t("interestedSizes")}
                    fullWidth={true}
                    inputVisible={false}
                    variantVal={true}
                  />
                  <PopoverOnHover
                    message={
                      "We would like to know this, to see if different size interests are equally represented within your loop. Also, knowing this makes it easier to split the route over time, depending on size interest!"
                    }
                  />
                </div>

                <FormActions handleClick={handleClickAction} />

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
            </div>
          </OneColumnLayout>
        )}
      </Formik>
    </>
  );
};

export default Signup;
