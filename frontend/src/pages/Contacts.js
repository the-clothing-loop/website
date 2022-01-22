// Material
import Typography from "@material-ui/core/Typography";
import { makeStyles, TextField } from "@material-ui/core";
import theme from "../util/theme";
import Button from "@material-ui/core/Button";
import { Alert } from "@material-ui/lab";

//Plugins
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

// Project resources
import { TextForm } from "../components/FormFields";
import { contactMail } from "../util/firebase/mail";
import { OneColumnLayout } from "../components/Layouts";

//media
import RightArrow from "../images/right-arrow-white.svg";

const Contacts = () => {
  const classes = makeStyles(theme)();

  const { t } = useTranslation();
  const [error, setError] = useState();
  const [submitted, setSubmitted] = useState(false);

  const CHARACTER_LIMIT = 2000;
  const [values, setValues] = useState({
    name: "",
  });

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const validate = Yup.object({
    name: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    email: Yup.string().email("Please enter a valid e-mail address"),
    message: Yup.string().min(2, "Must be more than 2 characters"),
  });

  const handleSubmit = async (data) => {
    let newEmail = {
      ...data,
      message: values.name,
    };

    console.log(`sending mail: ${JSON.stringify(newEmail)}`);

    try {
      await contactMail(newEmail);
      setSubmitted(true);
    } catch (e) {
      console.error(`Error sending mail: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  if (submitted) {
    return <Redirect to={`/message-submitted`} />;
  }

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Contacts</title>
        <meta name="description" content="Contacts" />
      </Helmet>
      <div className={classes.contactFormWrapper}>
        <OneColumnLayout>
          <Typography component="h3" className={classes.pageTitle}>Contact us</Typography>
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
            {({ errors, touched }) => (
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
                <TextField
                  placeholder={t("yourMessage")}
                  name="message"
                  type="text"
                  required
                  InputProps={{
                    disableUnderline: true,
                    maxLength: CHARACTER_LIMIT,
                    className: classes.textArea,
                    style:{marginTop: '30px'}
                  }}
                  value={values.name}
                  helperText={`${values.name.length}/${CHARACTER_LIMIT}`}
                  onChange={handleChange("name")}
                  multiline={true}
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
