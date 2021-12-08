// React / plugins
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import img from "../images/Naamloze-presentatie.jpeg";
import GeocoderSelector from "../components/GeocoderSelector";
import SizesDropdown from "../components/SizesDropdown";

// Material UI
import Typography from "@material-ui/core/Typography";
import { Alert } from "@material-ui/lab";
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
import { TwoColumnLayout } from "../components/Layouts";

// Project resources
import {
  PhoneFormField,
  TextForm,
  CheckboxField,
} from "../components/FormFields";
import { createUser } from "../util/firebase/user";
import { getChain } from "../util/firebase/chain";
import { IChain } from "../types";

const Signup = () => {
  const history = useHistory();
  const { chainId } = useParams<{ chainId: string }>();
  const [chain, setChain] = useState<IChain | null>(null);
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [geocoderResult, setGeocoderResult] = useState({
    result: { place_name: "" },
  });
  const [error, setError] = useState("");
  const classes = makeStyles(theme as any)();
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [chainGender, setChainGender] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const phoneRegExp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;

  const validate = Yup.object({
    name: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    email: Yup.string().email("Please enter a valid e-mail address"),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: "Please enter valid phone number",
      })
      .required("Required"),
    newsletter: Yup.boolean(),
  });

  // Get chain id from the URL and save to state
  useEffect(() => {
    (async () => {
      if (chainId) {
        const chain = await getChain(chainId);
        setChain(chain);
        setChainGender(chain.categories.gender);
      }
    })();
  }, [chainId]);

  // Gather data from form, validate and send to firebase
  const onSubmit = async (formData: any) => {
    // TODO: allow only full addresses

    try {
      let user = {
        ...formData,
        address: geocoderResult.result.place_name,
        chainId: chainId,
        interestedSizes: selectedSizes,
      };
      console.log(`creating user: ${JSON.stringify(user)}`);
      // TODO: do something with validation info for new user (e.g. display this)
      await createUser(user);
      setSubmitted(true);
    } catch (e:any) {
      console.error(`Error creating user: ${JSON.stringify(e)}`);
      setError(e.message);
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
          <title>Clothing-Loop | Signup user</title>
          <meta name="description" content="Signup user" />
        </Helmet>
        <Formik
          initialValues={{
            name: "",
            email: "",
            phoneNumber: "",
            newsletter: false,
          }}
          validationSchema={validate}
          onSubmit={(v) => onSubmit(v)}
        >
          {(formik) => (
            <TwoColumnLayout img={img}>
              <div id="container">
                <Typography variant="h3" className={classes.pageTitle}>
                  {t("join")}
                </Typography>

                <Typography variant="h3" className={classes.loopName}>
                  {chain?.name}
                </Typography>
                <Form>
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
                    onChange={(e: string) =>
                      formik.setFieldValue("phoneNumber", e)
                    }
                    style={{ marginTop: "10px" }}
                  />

                  <GeocoderSelector
                    name="address"
                    onResult={setGeocoderResult}
                  />

                  <SizesDropdown
                    className={classes.formSelect}
                    setSizes={setSelectedSizes}
                    genders={chainGender}
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
                      {t("back")}
                    </Button>
                    <Button type="submit" className={classes.buttonContained}>
                      {t("join")}
                    </Button>
                  </div>
                </Form>
              </div>
            </TwoColumnLayout>
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
              risus ac iaculis. Nunc commodo nulla id magna faucibus, et
              elementum diam ultrices. Suspendisse et lorem aliquam sapien
              finibus cursus. Nam id arcu sem. Quisque facilisis odio et erat
              pretium, ac interdum diam posuere. Nunc vulputate molestie quam,
              sit amet finibus velit mattis eget. Pellentesque molestie
              malesuada tincidunt. Proin a luctus mauris. Donec tortor justo,
              hendrerit sit amet turpis ac, interdum consectetur magna.
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
              connecting people in the neighborhood in a fun and sustainable
              way. The idea of the Clothing Loop is simple: (large) bags filled
              with clothing travel a route past all participants in a particular
              city or neighborhood. Do you receive the bag at home? Then you can
              take out what you like and put back something that is still in
              good condition, but ready for a new owner. If you want, you can
              share a photo with your new addition in the corresponding WhatsApp
              group. Then you take the bag to the next neighbor on the list. We
              started a year ago in Amsterdam in the Netherlands as a
              corona-proof, local alternative for clothing swap events and now
              have more than 7500 participants spread over more than 210 chains
              across the country. The success has now been picked up by numerous
              (national) media (see for example: NOS). Our goal is to spread
              this initiative globally. To this end, we are building an online
              platform where anyone, anywhere can start or join a chain.
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
  }
};

export default Signup;
