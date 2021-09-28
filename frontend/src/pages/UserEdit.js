import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

// Project resources
import { getUserById, updateUser } from "../util/firebase/user";
import ThreeColumnLayout from "../components/ThreeColumnLayout";
import {
  PhoneFormField,
  TextForm,
  CheckboxField,
} from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";

const UserEdit = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const [user, setUser] = useState();
  const [chainId, setChainId] = useState();
  const classes = makeStyles(theme)();
  const history = useHistory();
  const [geocoderResult, setGeocoderResult] = useState({
    result: { place_name: "" },
  });
  const [address, setAddress] = useState();
  const [uid, setUid] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const phoneRegExp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;

  const validate = Yup.object({
    name: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    email: Yup.string().email("Please enter a valid e-mail address"),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: "Please enter valid phonenumber",
      })
      .required("Required"),
    newsletter: Yup.boolean(),
    actionsNewsletter: Yup.boolean(),
  });

  const onSubmit = async (values) => {
    const newUserData = {
      ...values,
      address: address,
      chainId: chainId,
    };
    console.log(`updating user information: ${JSON.stringify(newUserData)}`);

    try {
      await updateUser(newUserData);
      setSubmitted(true);
      history.push({
        pathname: `/loops/members/${chainId}`,
        state: { message: t("saved") },
      });
    } catch (e) {
      console.error(`Error updating user: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const user = await getUserById(userId);
        setUser(user);
        setChainId(user.chainId);
        setAddress(user.address);
        setUid(user.uid);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return !user ? null : (
    <>
      <Helmet>
        <title>Clothing-Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
      <Formik
        initialValues={{
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          newsletter: user.newsletter,
          actionsNewsletter: user.actionsNewsletter,
          address: address,
          uid: userId,
        }}
        validationSchema={validate}
        onSubmit={onSubmit}
      >
        {({ formik, setFieldValue }) => (
          <ThreeColumnLayout>
            <Typography variant="h3" className={classes.pageTitle}>
              {t("edit user information")}
            </Typography>
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
                onChange={(e) =>
                  setFieldValue("phoneNumber", e.replace(/\s/g, ""))
                }
              />

              <GeocoderSelector
                onResult={(e) => {
                  setAddress(e.result.place_name);
                }}
              />
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

              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                {t("submit")}
              </Button>
              <Button
                onClick={() => history.push(`/loops/members/${chainId}`)}
                variant="contained"
                color="primary"
                className={classes.button}
              >
                {t("back")}
              </Button>
            </Form>
          </ThreeColumnLayout>
        )}
      </Formik>
    </>
  );
};

export default UserEdit;
