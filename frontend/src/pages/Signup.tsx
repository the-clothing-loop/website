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
import PopoverOnHover from "../components/Popover";

// Material UI
import Typography from "@material-ui/core/Typography";
import { Alert } from "@material-ui/lab";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";
import { TwoColumnLayout } from "../components/Layouts";

// Project resources
import { PhoneFormField, TextForm } from "../components/FormFields";
import { createUser } from "../util/firebase/user";
import { getChain } from "../util/firebase/chain";
import { IChain } from "../types";
import FormActions from "../components/formActions";

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
    } catch (e: any) {
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
                    onChange={(e: string) =>
                      formik.setFieldValue("phoneNumber", e)
                    }
                    style={{ marginTop: "10px" }}
                  />

                  <GeocoderSelector
                    name="address"
                    onResult={setGeocoderResult}
                  />

                  <div className={classes.sizesDropdownWrapper}>
                    <SizesDropdown
                      className={classes.formSelect}
                      setSizes={setSelectedSizes}
                      genders={chainGender}
                      sizes={selectedSizes}
                      label={t("interestedSizes")}
                      fullWidth={true}
                      inputVisible={true}
                    />
                    <PopoverOnHover
                      message={"please select the sizes you are interested in."}
                    />
                  </div>

                  <FormActions handleClick={handleClickAction} />

                  {error ? <Alert severity="error">{error}</Alert> : null}
                  <div className={classes.formSubmitActions}>
                    <Button
                      type="submit"
                      className={classes.buttonOutlined}
                      onClick={() =>
                        history.push({
                          pathname: "/loops/find",
                          state: { detail: "something" },
                        })
                      }
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
      </>
    );
  }
};

export default Signup;
