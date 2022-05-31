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

import { Alert, Button, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import { TwoColumnLayout } from "../components/Layouts";

// Project resources
import { PhoneFormField, TextForm } from "../components/FormFields";
import { createUser } from "../util/firebase/user";
import { getChain } from "../util/firebase/chain";
import { IChain } from "../types";
import FormActions from "../components/formActions";

//Media
import RightArrow from "../images/right-arrow-white.svg";
import JoinLoopImg from "../images/Join-Loop.jpg";

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
      .min(2, t("thereMustBeMoreThan"))
      .required(t("required")),
    email: Yup.string().email(t("pleaseEnterAValid.emailAddress")),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: t("pleaseEnterAValid.phoneNumber"),
      })
      .required(t("required")),
    newsletter: Yup.boolean(),
  });

  // Get chain id from the URL and save to state
  useEffect(() => {
    (async () => {
      if (chainId) {
        const chain = await getChain(chainId);
        if (chain !== undefined) {
          setChain(chain);
          setChainGender(chain.categories.gender);
        } else {
          console.error(`chain ${chainId} does not exist`);
        }
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
      e.code === "auth/invalid-phone-number"
        ? setError(t("pleaseEnterAValid.phoneNumber"))
        : setError(e.message);
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
        <Formik
          initialValues={{
            name: "",
            email: "",
            phoneNumber: "",
            newsletter: false,
          }}
          validationSchema={validate}
          validateOnChange={false}
          onSubmit={(v) => onSubmit(v)}
        >
          {(formik) => (
            <div className="signup-wrapper">
              <TwoColumnLayout img={JoinLoopImg}>
                <div id="container" className="signup-content">
                  <Typography variant="h3" className={classes.pageTitle}>
                    {t("join")}
                    <span> {chain?.name}</span>
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
                    />

                    <GeocoderSelector
                      name="address"
                      onResult={setGeocoderResult}
                    />

                    <div className={classes.formFieldWithPopover}>
                      <SizesDropdown
                        className={classes.formSelect}
                        setSizes={setSelectedSizes}
                        genders={chainGender}
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
                        onClick={() =>
                          history.push({
                            pathname: "/loops/find",
                            state: { detail: "something" },
                          })
                        }
                      >
                        {t("back")}
                      </Button>
                      <Button type="submit" className={classes.button}>
                        {t("join")}
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
              </TwoColumnLayout>
            </div>
          )}
        </Formik>
      </>
    );
  }
};

export default Signup;
