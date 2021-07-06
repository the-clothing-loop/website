import { useState, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
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
import { getChain, updateChain } from "../util/firebase/chain";
import GeocoderSelector from "../components/GeocoderSelector";
import { boolean } from "yup/lib/locale";
import { TextForm } from "../components/FormFields";
import ThreeColumnLayout from "../components/ThreeColumnLayout";

const ChainEdit = () => {
  const { t } = useTranslation();
  let history = useHistory();
  let location = useLocation();
  const { chainId } = useParams();

  const [chain, setChain] = useState();
  const classes = makeStyles(theme)();
  const [address, setAddress] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = Yup.object({
    name: Yup.string().min(2, "Must be more than 2 characters"),
    description: Yup.string().min(2, "Must be more than 2 characters"),
    published: Yup.boolean(),
  });

  const onClick = () => {
    history.push(`/chains/members/${chainId}`);
  };

  useEffect(async () => {
    const chain = await getChain(chainId);
    setChain(chain);
    setAddress(chain.address);
  }, []);

  return !chain ? null : (
    <>
      <Helmet>
        <title>Clothing-chain | Edit chain details</title>
        <meta name="description" content="Edit chain details" />
      </Helmet>{" "}
      <Formik
        initialValues={{
          name: chain.name,
          description: chain.description,
        }}
        validationSchema={validate}
        onSubmit={async (values) => {
          const newChainData = {
            ...values,
            address: address,
          };

          console.log(
            `updating chain information: ${JSON.stringify(newChainData)}`
          );
          try {
            updateChain(chainId, newChainData);
            setSubmitted(true);
            history.push({
              pathname: `/chains/members/${chainId}`,
              state: { message: t("saved") },
            });
          } catch (e) {
            console.error(`Error creating user: ${JSON.stringify(e)}`);
            setError(e.message);
          }
        }}
      >
        {({ errors, touched }) => (
          <ThreeColumnLayout>
            <Typography variant="h3" className={classes.pageTitle}>
              {t("edit chain information")}
            </Typography>
            <Form>
              <TextForm
                key="name"
                label="Name"
                name="name"
                type="text"
                className={classes.textField}
                error={touched.name && Boolean(errors.name)}
                helperText={errors.name && touched.name ? errors.name : null}
              />
              <TextForm
                key="description"
                label="Description"
                name="description"
                type="text"
                className={classes.textField}
                error={touched.description && Boolean(errors.description)}
                helperText={
                  errors.description && touched.description
                    ? errors.description
                    : null
                }
              />

              <GeocoderSelector
                onResult={(e) => setAddress(e.result.place_name)}
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
                onClick={onClick}
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
      );
    </>
  );
};

export default ChainEdit;
