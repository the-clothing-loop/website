import { Typography, Button, Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

//Plugins
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

// Project resources
import { TextForm } from "../components/FormFields";
import { OneColumnLayout } from "../components/Layouts";

//media
import RightArrow from "../images/right-arrow-white.svg";
import { contactMailSend } from "../api/contact";

interface SubmitMail {
  name: string;
  email: string;
  message: string;
}

const Contacts = () => {
  const classes = makeStyles(theme as any)();

  const { t } = useTranslation();
  const [error, setError] = useState();
  const [submitted, setSubmitted] = useState(false);

  const CHARACTER_LIMIT = 2000;

  const validate = Yup.object({
    name: Yup.string()
      .min(2, "Must be at least 2 characters")
      .required(t("required")),
    email: Yup.string()
      .required(t("required"))
      .email(t("pleaseEnterAValid.emailAddress")),
    message: Yup.string()
      .required(t("required"))
      .min(2, "Must be at least 2 characters"),
  } as Record<keyof SubmitMail, any>);

  const handleSubmit = async (data: SubmitMail) => {
    let newEmail = { ...data };

    console.log(`sending mail: ${JSON.stringify(newEmail)}`);

    try {
      await contactMailSend(data.name, data.email, data.message);
      setSubmitted(true);
    } catch (e: any) {
      console.error(`Error sending mail: ${JSON.stringify(e)}`);
      setError(e?.data || `Error: ${JSON.stringify(e)}`);
    }
  };

  if (submitted) {
    return <Redirect to={`/message-submitted`} />;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Contact Us</title>
        <meta name="description" content="Contact us" />
      </Helmet>
      <div className={classes.contactFormWrapper}>
        <OneColumnLayout>
          <Typography component="h3" className={classes.pageTitle}>
            Contact us
          </Typography>
          <Typography component="p">
            Questions? Funny stories? Tips? Press enquiries? We’d love to hear
            from you! (Please do check our FAQ first!)
          </Typography>

          <Formik
            initialValues={{
              name: "",
              email: "",
              message: "",
            }}
            validationSchema={validate}
            validateOnChange={false}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched }) => (
              <Form className="contact-form">
                <TextForm
                  label={t("name")}
                  name="name"
                  type="text"
                  className={classes.textField}
                  required
                />
                {touched.name && errors.name && (
                  <div className={classes.errorDiv}>{errors.name}</div>
                )}
                <TextForm
                  label={t("email")}
                  name="email"
                  type="text"
                  className={classes.textField}
                  required
                />
                {touched.email && errors.email && (
                  <div className={classes.errorDiv}>{errors.email}</div>
                )}
                <TextForm
                  label=""
                  placeholder={t("yourMessage")}
                  name="message"
                  type="text"
                  required
                  InputProps={
                    {
                      disableUnderline: true,
                      maxLength: CHARACTER_LIMIT,
                      classes: {
                        root: classes.textArea,
                        input: classes.textAreaPlaceholder,
                      },
                      style: { marginTop: "30px" },
                    } as any
                  }
                  helperText={`${values.message.length}/${CHARACTER_LIMIT}`}
                  multiline
                  rows={10}
                />

                {touched.message && errors.message && (
                  <div className={classes.errorDiv}>{errors.message}</div>
                )}
                {error ? <Alert severity="error">{error}</Alert> : null}
                <div className={classes.cardsAction}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                  >
                    {t("submit")}
                    <img src={RightArrow} alt="" />
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </OneColumnLayout>
      </div>
    </>
  );
};

export default Contacts;
