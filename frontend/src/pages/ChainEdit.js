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
import InputLabel from "@mui/material/InputLabel";

// Project resources
import { getChain, updateChain } from "../util/firebase/chain";
import GeocoderSelector from "../components/GeocoderSelector";
import { TextForm } from "../components/FormFields";
import { ThreeColumnLayout } from "../components/Layouts";
import categories from "../util/categories";
import SizesDropdown from "../components/SizesDropdown";
import CategoriesDropdown from "../components/CategoriesDropdown";

//media
import RightArrow from "../images/right-arrow-white.svg";

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
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);

  const validate = Yup.object({
    name: Yup.string().min(2, "Must be more than 2 characters"),
    description: Yup.string().min(2, "Must be more than 2 characters"),
  });

  const handleSubmit = async (values) => {
    const newChainData = {
      ...values,
      address: address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      categories: {
        size: selectedSizes,
        gender: selectedGenders,
      },
    };

    console.log(`updating chain information: ${JSON.stringify(newChainData)}`);
    try {
      await updateChain(chainId, newChainData);
      setSubmitted(true);
      history.push({
        pathname: `/loops/members/${chainId}`,
        state: { message: t("saved") },
      });
    } catch (e) {
      console.error(`Error creating user: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  useEffect(async () => {
    const chain = await getChain(chainId);
    setChain(chain);
    setAddress(chain.address);
    setCoordinates({
      latitude: chain.latitude,
      longitude: chain.longitude,
    });

    setSelectedSizes(chain.categories.size);
    setSelectedGenders(chain.categories.gender);
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
              {t(`editLoopInformation`)}
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
              <div style={{ paddingTop: "10px" }}>
                <CategoriesDropdown
                  setGenders={setSelectedGenders}
                  genders={selectedGenders}
                  className={classes.select}
                  label={t("categories")}
                  fullWidth={true}
                />
              </div>
              <div style={{ paddingTop: "10px" }}>
                <SizesDropdown
                  className={classes.select}
                  setSizes={setSelectedSizes}
                  genders={selectedGenders}
                  sizes={selectedSizes}
                  label={t("sizes")}
                  fullWidth={false}
                  inputVisible={true}
                />
              </div>
              {/* TODO: implement location when admin edits loop 
              to match the new loop location logic*/}
              <GeocoderSelector
                onResult={(e) => {
                  setAddress(e.result.place_name);
                  setCoordinates({
                    longitude: e.result.geometry.coordinates[0],
                    latitude: e.result.geometry.coordinates[1],
                  });
                }}
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

export default ChainEdit;
