import { useState, useEffect } from "react";
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
import { IUser } from "../types";

const UserEdit = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const history = useHistory();

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<IUser>();
  const { userId } = useParams<{ userId: string }>();
  const [chainId, setChainId] = useState<IUser["chainId"]>();
  const [address, setAddress] = useState<IUser["address"]>();
  const [selectedSizes, setSelectedSizes] = useState<IUser["selectedSizes"]>(
    []
  );
  const [uid, setUid] = useState<IUser["uid"]>();
  const [newsletter, setNewsletter] = useState<IUser["newsletter"]>(false);
  const [userRole, setUserRole] = useState<IUser["userRole"]>("");

  const phoneRegExp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;

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

  const onSubmit = async (values: Partial<IUser>) => {
    const newUserData: Partial<IUser> = {
      ...values,
      address: address,
      chainId: chainId,
      interestedSizes: selectedSizes,
    };
    console.log(`updating user information: ${JSON.stringify(newUserData)}`);

    try {
      await updateUser(newUserData as IUser);
      setSubmitted(true);
      history.push({
        pathname: `/loops/${chainId}/members`,
        state: { message: t("saved") },
      });
    } catch (e: any) {
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
        <title>The Clothing Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
      <Formik<Partial<IUser>>
        initialValues={{
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          newsletter: user.newsletter,
          address: address as string,
          uid: userId,
          interestedSizes: selectedSizes,
        }}
        validationSchema={validate}
        validateOnChange={false}
        onSubmit={onSubmit}
      >
        {({ setFieldValue }) => (
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
                onChange={(e: any) =>
                  setFieldValue("phoneNumber", e.replace(/\s/g, ""))
                }
              />

              <SizesDropdown
                variant="standard"
                showInputLabel={true}
                label={t("interestedSizes")}
                selectedGenders={Object.keys(categories)}
                selectedSizes={selectedSizes}
                handleSelectedCategoriesChange={setSelectedSizes}
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
                type="checkbox"
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
