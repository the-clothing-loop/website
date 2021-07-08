import { useState, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
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
import { getChain, updateChain } from "../util/firebase/chain";
import GeocoderSelector from "../components/GeocoderSelector";
import { TextForm, CheckboxField } from "../components/FormFields";
import ThreeColumnLayout from "../components/ThreeColumnLayout";

const ChainEdit = () => {
  const { t } = useTranslation();
  let history = useHistory();
  let location = useLocation();
  const { chainId } = useParams();

  const [chain, setChain] = useState();
  const classes = makeStyles(theme)();
  const [address, setAddress] = useState();
  const [coordinates, setCoordinates] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [categoriesState, setCategoriesState] = useState({});

  const validate = Yup.object({
    name: Yup.string().min(2, "Must be more than 2 characters"),
    description: Yup.string().min(2, "Must be more than 2 characters"),
  });

  const handleChange = (e) => {
    if (e.target.checked) {
      setCategoriesState({
        ...categoriesState,
        [e.target.name]: true,
      });
    } else {
      setCategoriesState({
        ...categoriesState,
        [e.target.name]: false,
      });
    }
  };

  const handleSubmit = async (values) => {
    const newChainData = {
      ...values,
      address: address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      categories: {
        gender: Object.keys(categoriesState).filter((e) => {
          return categoriesState[e] === true;
        }),
      },
    };

    console.log(`updating chain information: ${JSON.stringify(newChainData)}`);
    try {
      await updateChain(chainId, newChainData);
      setSubmitted(true);
      history.push({
        pathname: `/chains/members/${chainId}`,
        state: { message: t("saved") },
      });
    } catch (e) {
      console.error(`Error creating user: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  //refactor db data from array to obj
  const mapCat = (array) => {
    return {
      men: array.includes("men"),
      woman: array.includes("woman"),
      mix: array.includes("mix"),
    };
  };

  useEffect(async () => {
    const chain = await getChain(chainId);
    setChain(chain);
    setAddress(chain.address);
    setCoordinates({
      latitude: chain.latitude,
      longitude: chain.longitude,
    });

    setCategoriesState(mapCat(chain.categories.gender));
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
        onSubmit={handleSubmit}
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

              <CheckboxField
                name="woman"
                label="woman"
                onChange={handleChange}
                checked={categoriesState.woman ? true : false}
              />
              <CheckboxField
                name="men"
                label="men"
                onChange={handleChange}
                checked={categoriesState.men ? true : false}
              />
              <CheckboxField
                name="mix"
                label="mix"
                onChange={handleChange}
                checked={categoriesState.mix ? true : false}
              />

              <GeocoderSelector
                onResult={(e) => {
                  setAddress(e.result.place_name);
                  setCoordinates({
                    longitude: e.result.geometry.coordinates[0],
                    latitude: e.result.geometry.coordinates[1],
                  });
                }}
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
                onClick={() => history.push(`/chains/members/${chainId}`)}
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
