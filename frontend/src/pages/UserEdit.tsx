import { useState, useEffect, useMemo } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Material UI
import { Typography, Button, Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

// Project resources
import { ThreeColumnLayout } from "../components/Layouts";
import SizesDropdown from "../components/SizesDropdown";
import categories from "../util/categories";

//media
import RightArrow from "../images/right-arrow-white.svg";

import {
  PhoneFormField,
  TextForm,
  CheckboxField,
} from "../components/FormFields";
import GeocoderSelector from "../components/GeocoderSelector";
import { UID, User } from "../api/types";
import { userGetByUID, userUpdate } from "../api/user";
import { phoneRegExp } from "../util/phoneRegExp";

interface Params {
  userUID: UID;
}

interface State {
  chainUID: UID;
}

interface UserEditForm {
  name: string;
  phoneNumber: string;
  newsletter: boolean;
  sizes: string[];
  address: string;
}

const UserEdit = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const history = useHistory();
  const state = useLocation<State>().state;

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<User>();
  const params = useParams<Params>();

  const userIsChainAdmin = useMemo(
    () =>
      user?.chains.find((c) => c.chain_uid == state.chainUID)?.is_chain_admin ||
      false,
    [user]
  );

  const validate = Yup.object({
    name: Yup.string().min(2, t("mustBeAtLeastChar")).required(t("required")),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, {
        message: t("pleaseEnterAValid.phoneNumber"),
      })
      .required(t("required")),
    newsletter: Yup.boolean(),
    address: Yup.string(),
    sizes: Yup.array().of(Yup.string()),
  } as Record<keyof UserEditForm, any>);

  const onSubmit = async (values: UserEditForm) => {
    console.log("values:", values);

    try {
      await userUpdate({
        name: values.name,
        phone_number: values.phoneNumber,
        newsletter: values.newsletter,
        address: values.address,
        sizes: values.sizes,
      });
      setSubmitted(true);
      setTimeout(() => {
        history.goBack();
      }, 1200);
    } catch (e: any) {
      console.error(`Error updating user: ${JSON.stringify(e)}`);
      setError(e?.data || `Error: ${JSON.stringify(e)}`);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const user = (await userGetByUID(state.chainUID, params.userUID)).data;
        setUser(user);
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [history]);

  return !user ? null : (
    <>
      <Helmet>
        <title>The Clothing Loop | Edit user</title>
        <meta name="description" content="Edit user" />
      </Helmet>
      <Formik<UserEditForm>
        initialValues={{
          name: user.name,
          phoneNumber: user.phone_number,
          newsletter: true,
          address: user.address,
          sizes: [...user.sizes],
        }}
        validationSchema={validate}
        validateOnChange={false}
        onSubmit={onSubmit}
      >
        {({ setFieldValue, values }) => (
          <ThreeColumnLayout>
            {user.is_root_admin || userIsChainAdmin ? (
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

              {/* <TextForm
                label={t("email")}
                name="email"
                type="email"
                className={classes.textField}
              /> */}
              <PhoneFormField
                label={t("phoneNumber")}
                name="phoneNumber"
                onChange={(e: any) => setFieldValue("phoneNumber", e)}
              />

              <SizesDropdown
                filteredGenders={Object.keys(categories)}
                selectedSizes={values.sizes || []}
                handleChange={(s) => setFieldValue("sizes", s)}
                style={{ marginTop: "2%" }}
              />

              <GeocoderSelector
                userAddress={values.address}
                onResult={(e) => {
                  setFieldValue("address", e.result.place_name);
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
                  onClick={() => history.goBack()}
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
                {submitted && (
                  <Alert severity="success" sx={{ marginTop: 4 }}>
                    {t("saved")}
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ marginTop: 4 }}>
                    {error}
                  </Alert>
                )}
              </div>
            </Form>
          </ThreeColumnLayout>
        )}
      </Formik>
    </>
  );
};

export default UserEdit;
