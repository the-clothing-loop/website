import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Material UI
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

// Project resources
import { getUserById, updateUser } from "../util/firebase/user";
import { ThreeColumnLayout } from "../components/Layouts";
import SizesDropdown from "../components/SizesDropdown";
import categories from "../util/categories";
import Popover from "../components/Popover";

//media
import RightArrow from "../images/right-arrow-white.svg";

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
  const [address, setAddress] = useState();
  const [uid, setUid] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);

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
  });

  const onSubmit = async (values) => {
    const newUserData = {
      ...values,
      address: address,
      chainId: chainId,
      interestedSizes: selectedSizes,
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
        setNewsletter(user.newsletter);
        setUserRole(user.role);

        if (user.interestedSizes === null) {
          setSelectedSizes([]);
        } else {
          setSelectedSizes(user.interestedSizes);
        }
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
          address: address,
          uid: userId,
          interestedSizes: selectedSizes,
        }}
        validationSchema={validate}
        onSubmit={onSubmit}
      >
        {({ formik, setFieldValue }) => (
          <ThreeColumnLayout>
            {userRole === "chainAdmin" ? (
              <Typography variant="h3" className={classes.pageTitle}>
                {t("editAdminContacts")}
              </Typography>
            ) : (
              <Typography variant="h3" className={classes.pageTitle}>
                {t("editParticipantContacts")}
              </Typography>
            )}
            <Form>
              <TextForm
                label={t("name")}
                name="name"
                type="text"
                className={classes.textField}
              />

              <TextForm
                label={t("email")}
                name="email"
                type="email"
                className={classes.textField}
              />
              <PhoneFormField
                label={t("phoneNumber")}
                name="phoneNumber"
                onChange={(e) =>
                  setFieldValue("phoneNumber", e.replace(/\s/g, ""))
                }
              />
              <div style={{ position: "relative", marginTop: "2%" }}>
                <SizesDropdown
                  className={classes.formSelect}
                  setSizes={setSelectedSizes}
                  genders={Object.keys(categories)}
                  sizes={selectedSizes}
                  label={t("interestedSizes")}
                  fullWidth={true}
                  inputVisible={true}
                />
                <Popover message={t("ifNoSizesAreShowing")} />
              </div>

              <GeocoderSelector
                userAddress={user.address}
                onResult={(e) => {
                  setAddress(e.result.place_name);
                }}
              />
              <CheckboxField
                label={t("newsletterSubscription")}
                name="newsletter"
                type="checkbox"
                style={{ padding: "2% 0" }}
              />

              <div className={classes.buttonsWrapper}>
                <Button
                  onClick={() => history.push(`/loops/members/${chainId}`)}
                  variant="contained"
                  color="primary"
                  className={classes.buttonOutlined}
                >
                  {t("back")}
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  className={classes.button}
                >
                  {t("submit")}
                  <img src={RightArrow} alt="" />
                </Button>
              </div>
            </Form>
          </ThreeColumnLayout>
        )}
      </Formik>
    </>
  );
};

export default UserEdit;
