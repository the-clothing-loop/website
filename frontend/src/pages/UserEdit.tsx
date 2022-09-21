import { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Material UI
import { Typography, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

// Project resources
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
import { UID, User } from "../api/types";
import { userGetByUID, userUpdate, UserUpdateBody } from "../api/user";
import { AuthContext } from "../components/AuthProvider";

interface Params {
  userUID: string;
}

const UserEdit = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const history = useHistory();
  const { authUser } = useContext(AuthContext);

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<User>();
  const params = useParams<Params>();
  const [userUID, setUserUID] = useState<UID>(params.userUID);
  const [chainId, setChainUID] = useState<UID>();
  const [address, setAddress] = useState<UserUpdateBody["address"]>();
  const [sizes, setSizes] = useState<UserUpdateBody["sizes"]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userIsChainAdmin, setUserIsChainAdmin] = useState(false);

  const phoneRegExp = /^\+?\(?[0-9]{1,3}\)?[-\s\./0-9]+$/g;

  const validate = Yup.object({
    name: Yup.string().min(2, t("mustBeAtLeastChar")).required(t("required")),
    email: Yup.string().email(t("pleaseEnterAValid.emailAddress")),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: t("pleaseEnterAValid.phoneNumber"),
      })
      .required(t("required")),
    newsletter: Yup.boolean(),
  });

  const onSubmit = async (values: UserUpdateBody) => {
    const newUserData: UserUpdateBody = {
      ...values,
      address: address,
      sizes: sizes,
    };
    console.log(`updating user information: ${JSON.stringify(newUserData)}`);

    try {
      await userUpdate(newUserData);
      setSubmitted(true);
      history.push({
        pathname: `/loops/${chainId}/members`,
        state: { message: t("saved") },
      });
    } catch (e: any) {
      console.error(`Error updating user: ${JSON.stringify(e)}`);
      setError(e.message || e.data || "");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const user = (
          await userGetByUID(authUser!.chains[0].chain_uid, userUID)
        ).data;
        const firstChain = user.chains[0];
        setUser(user);
        setChainUID(firstChain.chain_uid);
        setAddress(user.address);
        setUserUID(user.uid);
        // TODO: add newsletter back into user
        // setNewsletter(user.newsletter);
        setUserIsAdmin(user.is_admin);
        setUserIsChainAdmin(firstChain.is_chain_admin);
        setSizes(user.sizes || []);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return !user ? null : (
    <>
      <Helmet>
        <title>The Clothing Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
      <Formik<Partial<User>>
        initialValues={{
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          // newsletter: user.newsletter,
          address: address as string,
          uid: userUID,
          sizes: sizes,
        }}
        validationSchema={validate}
        validateOnChange={false}
        onSubmit={onSubmit}
      >
        {({ setFieldValue }) => (
          <ThreeColumnLayout>
            {userIsAdmin || userIsChainAdmin ? (
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
                onChange={(e: any) =>
                  setFieldValue("phoneNumber", e.replace(/\s/g, ""))
                }
              />

              <SizesDropdown
                variant="standard"
                showInputLabel={true}
                label={t("sizes")}
                genders={Object.keys(categories)}
                sizes={sizes || []}
                handleSelectedCategoriesChange={setSizes}
                style={{ marginTop: "2%" }}
              />

              <GeocoderSelector
                userAddress={user.address}
                onResult={(e) => {
                  setAddress(e.result.place_name);
                }}
              />
              <CheckboxField
                required={false}
                label={t("newsletterSubscription")}
                name="newsletter"
                style={{ padding: "2% 0" }}
              />

              <div className={classes.buttonsWrapper}>
                <Button
                  onClick={() => history.push(`/loops/${chainId}/members`)}
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
