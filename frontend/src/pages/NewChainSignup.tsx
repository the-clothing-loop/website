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
import {
  makeStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import theme from "../util/theme";
import { ThreeColumnLayout } from "../components/Layouts";
import { Alert } from "@material-ui/lab";

// Project resources
import {
  PhoneFormField,
  TextForm,
  CheckboxField,
} from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { AuthContext } from "../components/AuthProvider";
import { createUser } from "../util/firebase/user";
import SizesDropdown from "../components/SizesDropdown";
import categories from "../util/categories";

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
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

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
          } catch (e:any) {
            console.error(`Error creating user: ${JSON.stringify(e)}`);
            setError(e.message);
          }
        }}
      >
        {({ errors, touched, setFieldValue }) => (
          <ThreeColumnLayout>
            <div>
              <Typography variant="h3" className={classes.pageTitle}>
                {t("startNewChain")}
              </Typography>

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
                <SizesDropdown
                  className={classes.formSelect}
                  setSizes={setSelectedSizes}
                  genders={categories.genders}
                  sizes={selectedSizes}
                  label={t("interestedSizes")}
                  fullWidth={true}
                />

                <CheckboxField
                  required={false}
                  label={
                    <>
                      <div className={classes.actionsWrapper}>
                        {" "}
                        <Typography component="p" className={classes.p}>
                          {t("subscribeTo")}
                        </Typography>
                        <a
                          href="#newsletter"
                          onClick={(e: any) =>
                            handleClickAction(e, setNewsletterOpen)
                          }
                          id="newsletterPopup"
                          className={classes.a}
                        >
                          The Clothing Loop Newsletter
                        </a>
                      </div>
                    </>
                  }
                  name="newsletter"
                  type="checkbox"
                />
                <CheckboxField
                  required={true}
                  label={
                    <>
                      <div className={classes.actionsWrapper}>
                        <Typography component="p" className={classes.p}>
                          {t("agreeToOur")}
                        </Typography>
                        <a
                          href="#privacyPolicy"
                          onClick={(e: any) =>
                            handleClickAction(e, setPrivacyPolicyOpen)
                          }
                          id="privacyPolicyPopup"
                          className={classes.a}
                        >
                          Privacy Policy*
                        </a>
                      </div>
                    </>
                  }
                  name="privacyPolicy"
                  type="checkbox"
                />
                {error ? <Alert severity="error">{error}</Alert> : null}
                <div style={{ display: "flex" }}>
                  <Button
                    type="submit"
                    className={classes.buttonOutlined}
                    onClick={() => history.push("/loops/find")}
                  >
                    {" "}
                    {t("back")}
                  </Button>
                  <Button type="submit" className={classes.buttonContained}>
                    {t("next")}
                  </Button>
                </div>
              </Form>
            </div>
          </ThreeColumnLayout>
        )}
      </Formik>
      <Dialog
        open={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"The Clothing Loop Newsletter"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque ullamcorper eget nisi sed facilisis. Proin feugiat a
            risus ac iaculis. Nunc commodo nulla id magna faucibus, et elementum
            diam ultrices. Suspendisse et lorem aliquam sapien finibus cursus.
            Nam id arcu sem. Quisque facilisis odio et erat pretium, ac interdum
            diam posuere. Nunc vulputate molestie quam, sit amet finibus velit
            mattis eget. Pellentesque molestie malesuada tincidunt. Proin a
            luctus mauris. Donec tortor justo, hendrerit sit amet turpis ac,
            interdum consectetur magna.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsletterOpen(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={privacyPolicyOpen}
        onClose={() => setPrivacyPolicyOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Privacy Policy"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            We are buying more and more garments and wearing them shorter and
            shorter. The Clothing Loop tackles this growing problem – while
            connecting people in the neighborhood in a fun and sustainable way.
            The idea of the Clothing Loop is simple: (large) bags filled with
            clothing travel a route past all participants in a particular city
            or neighborhood. Do you receive the bag at home? Then you can take
            out what you like and put back something that is still in good
            condition, but ready for a new owner. If you want, you can share a
            photo with your new addition in the corresponding WhatsApp group.
            Then you take the bag to the next neighbor on the list. We started a
            year ago in Amsterdam in the Netherlands as a corona-proof, local
            alternative for clothing swap events and now have more than 7500
            participants spread over more than 210 chains across the country.
            The success has now been picked up by numerous (national) media (see
            for example: NOS). Our goal is to spread this initiative globally.
            To this end, we are building an online platform where anyone,
            anywhere can start or join a chain.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyPolicyOpen(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Signup;
