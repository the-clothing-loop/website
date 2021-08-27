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
import categories from "../util/categories";

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
  const [sizes, setSizes] = useState({});
  const [genders, setGenders] = useState({});

  const validate = Yup.object({
    name: Yup.string().min(2, "Must be more than 2 characters"),
    description: Yup.string().min(2, "Must be more than 2 characters"),
  });

  const handleChange = (e, categories, setCategories) => {
    if (e.target.checked) {
      setCategories({
        ...categories,
        [e.target.name]: true,
      });
    } else {
      setCategories({
        ...categories,
        [e.target.name]: false,
      });
    }
  };

  const getValues = (obj) => {
    return Object.keys(obj).filter((e) => {
      return obj[e] === true;
    });
  };

  const handleSubmit = async (values) => {
    const newChainData = {
      ...values,
      address: address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      categories: {
        gender: getValues(genders),
        size: getValues(sizes),
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
  const convertArrayToObject = (array) => {
    let obj = {};
    array.forEach((element) => {
      obj[element] = array.includes(element);
    });
    return obj;
  };

  useEffect(async () => {
    const chain = await getChain(chainId);
    setChain(chain);
    setAddress(chain.address);
    setCoordinates({
      latitude: chain.latitude,
      longitude: chain.longitude,
    });

    setGenders(convertArrayToObject(chain.categories.gender));
    setSizes(convertArrayToObject(chain.categories.size));
  }, []);

  return !chain ? null : (
    <>
      <Helmet>
        <title>Clothing-Loop | Edit Loop details</title>
        <meta name="description" content="Edit Loop details" />
      </Helmet>
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

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div>
                  <Typography
                    component="p"
                    style={{ textAlign: "left", textTransform: "capitalize" }}
                  >
                    categories
                  </Typography>
                  <div style={{ display: "flex", padding: "2% 0" }}>
                    {categories.genders.map((value, i) => {
                      return (
                        <div key={value}>
                          <input
                            className="map-cat-input"
                            key={`input-${value}-${i}`}
                            id={value}
                            type="checkbox"
                            name={value}
                            onChange={(e) =>
                              handleChange(e, genders, setGenders)
                            }
                            checked={!!genders[value]}
                          ></input>
                          <label key={`label-${value}-${i}`} htmlFor={value}>
                            <Typography variant="body2">{`${value}'s clothing`}</Typography>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Typography
                    component="p"
                    style={{ textAlign: "left", textTransform: "capitalize" }}
                  >
                    sizes
                  </Typography>
                  <div style={{ display: "flex", padding: "2% 0" }}>
                    {categories.sizes.map((value, i) => {
                      return (
                        <div key={value}>
                          <input
                            className="map-cat-input"
                            key={value}
                            id={value}
                            type="checkbox"
                            name={value}
                            onChange={(e) => handleChange(e, sizes, setSizes)}
                            checked={!!sizes[value]}
                          ></input>
                          <label
                            key={`label-${value}-${i}`}
                            htmlFor={value}
                            style={{
                              textTransform: "uppercase",
                              width: "40px",
                              height: "40px",
                              padding: "0",
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              className="input-label-typography"
                            >
                              {value}
                            </Typography>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

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
