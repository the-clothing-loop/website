import { useState } from "react";
import { Helmet } from "react-helmet";
import { Redirect, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMapGL, { SVGOverlay, FlyToInterpolator } from "react-map-gl";
import destination from "@turf/destination";
import { Form, Formik } from "formik";
import * as Yup from "yup";

// Material UI
import { Button, FormControl, makeStyles, MenuItem, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Grid from "@material-ui/core/Grid";

// Project resources
import theme from "../util/theme";
import Geocoding from "./Geocoding";
import { IViewPort } from "../types";
import { createChain } from "../util/firebase/chain";
import { TextForm, NumberField, SelectField } from "../components/FormFields";
import ProgressBar from "../components/ProgressBar"
import categories,  {allSizes} from "../util/categories";
import PopoverOnHover from "../components/Popover";

const accessToken = process.env.REACT_APP_MAPBOX_KEY || '';

const NewChainLocation = () => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [viewport, setViewport] = useState<IViewPort>({
    longitude: 0,
    latitude: 0,
    width: "40vw",
    height: "40vh",
    zoom: 1,
  });

  const flyToLocation = (longitude: number, latitude: number) => {
    setViewport({
      ...viewport,
      longitude: longitude,
      latitude: latitude,
      zoom:10,
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
    });
  };

  const handleGeolocationResult = ({result: {center}}: {result: {center: [number, number]} }) => {
    flyToLocation(...center);
  };

  const getPlaceName = async ([longitude, latitude]: [number, number]) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&cachebuster=1618224066302&autocomplete=true&types=locality%2Cplace`
    );
    const data = await response.json();
    return data.features[0].place_name;
  };

  const formSchema = Yup.object().shape({
    loopName: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    description: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    radius: Yup.number()
      .required("Required"),
    clothingType: Yup.string()
      .oneOf(Object.keys(categories))
      .required("Required"),
    clothingSize: Yup.string()
      .oneOf(allSizes)
      .required("Required"),
    coordinates: Yup.array().of(Yup.number())
  });

  const handleSubmit = async (values: any) => {
    const newChain = {
      name: values.name,
      description: values.description,
      longitude: values.coordinates[0],
      latitude: values.coordinates[1],
      categories: { gender: values.clothingType, size: values.clothingSize },
      address: await getPlaceName(values.coordinates),
      published: false,
      uid: userId,
    };

    console.log(`creating chain: ${JSON.stringify(newChain)}`);
    try {
      await createChain(newChain);
      setSubmitted(true);
    } catch (e: any) {
      console.error(`Error creating chain: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  if (submitted) {
    return <Redirect to={`/thankyou`} />;
  }

  return (
    <>
      <Helmet>
        <title>Clothing Loop | Create New Loop</title>
        <meta name="description" content="Create New Loop" />
      </Helmet>
      <Formik
        initialValues={{
          loopName: "",
          description: "",
          radius: 3,
          clothingType: "",
          clothingSize: "",
          coordinates: [null, null],
        }}
        validationSchema={formSchema}
        validate={(values) => {
          if (values.coordinates.some(el => el === null)) {
            return {coordinates: "Please set the loop location by clicking the map"};
          }
        }}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleChange }) => {
          const handleMapClick = (event: any) => {
            const targetClass = String(event.srcEvent.target?.className);
            if (targetClass.includes("mapboxgl-ctrl-geocoder")) {
              // ignore clicks on geocoding search bar, which is on top of map
              return;
            };
            setFieldValue("coordinates", event.lngLat)
            flyToLocation(event.lngLat[0], event.lngLat[1]);
          };

          const redrawLoop = ({ project }: { project: any }) => {
            const [longitude, latitude] = values.coordinates;
            if (longitude === null || latitude === null) {
              return;
            }
            const [centerX, centerY] = project([longitude, latitude]);
            // get the coordinates of a point the right distance away from center
            const boundaryPoint = destination(
              [longitude, latitude],
              values.radius,
              0,  // due north
              {units: "kilometers"},
            );
            const [_, boundaryY] = project(boundaryPoint.geometry.coordinates);
            const projectedRadius = centerY - boundaryY;

            return (
              <>
                <defs>
                    <radialGradient id="feather">
                        <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.4" />
                        <stop offset="50%" stopColor={theme.palette.primary.main} stopOpacity="0.4"/>
                        <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0"/>
                    </radialGradient>
                </defs>
                <circle cx={centerX} cy={centerY} r={projectedRadius} fill="url(#feather)" />;
              </>
            );
          };

          const handleClothingTypeChange = (event: any) => {
            const newType = event.target.value;
            if ( newType && ! categories[newType].includes(values.clothingSize)) {
              setFieldValue("clothingSize", "");
            }
            setFieldValue("clothingType", newType);
          };

          return (
            <div className={classes.formContainer}>
              <Grid container className={classes.form}>
                <Grid item xs={12}>
                  <Typography variant="h3" className={classes.pageTitle}>
                    {t("startNewLoop")}
                  </Typography>
                  <ProgressBar activeStep={1} />
                </Grid>
                <Grid item xs={12}>
                  <Typography className="formSubtitle">
                    {t("clickToSetLoopLocation")}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReactMapGL
                    mapboxApiAccessToken={accessToken}
                    mapStyle="mapbox://styles/mapbox/light-v10"
                    {...viewport}
                    onViewportChange={(newView: IViewPort) => setViewport(newView)}
                    onClick={handleMapClick}
                    getCursor={() => "pointer"}
                    className={classes.newLoopMap}
                    width="100%"
                  >
                    <Geocoding
                      onResult={handleGeolocationResult}
                      className={classes.inMapSearchBar}
                    />
                    {values.coordinates.every(coord => (coord !== null)) ? (
                      <SVGOverlay redraw={redrawLoop} />
                    ) : null}
                  </ReactMapGL>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Form noValidate={true}>
                    <Grid container>
                      <Grid item xs={9}>
                        <TextForm
                          required
                          label={t("loopName")}
                          name="loopName"
                          type="text"
                          value={values.loopName}
                          error={touched.loopName && Boolean(errors.loopName)}
                          helperText={touched.loopName && errors.loopName ? errors.loopName : null}
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <NumberField
                          required
                          label={t("radius")}
                          name="radius"
                          value={values.radius}
                          error={touched.radius && Boolean(errors.radius)}
                          helperText={touched.radius && errors.radius ? errors.radius : null}
                          className={classes.textField}
                          step={0.1}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextForm
                          required
                          label={t("description")}
                          name="description"
                          value={values.description}
                          error={touched.description && Boolean(errors.description)}
                          helperText={touched.description && errors.description ? errors.description : null}
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <div className={classes.formFieldWithPopover}>
                          <FormControl fullWidth>
                            <SelectField
                              name="clothingType"
                              label="selectClothingType"
                              errorText={touched.clothingType ? errors.clothingType : ""}
                              onChange={handleClothingTypeChange}
                              required
                            >
                              {Object.keys(categories).map((category: string) => (
                                <MenuItem value={category} key={category}>
                                  {t(category)}
                                </MenuItem>
                              ))}
                            </SelectField>
                          </FormControl>
                          <PopoverOnHover message="Some extra information about the field" />
                        </div>
                      </Grid>
                      <Grid item xs={12}>
                        <div className={classes.formFieldWithPopover}>
                          <FormControl fullWidth>
                            <SelectField
                              name="clothingSize"
                              label="selectSize"
                              value={values.clothingSize}
                              required
                              onChange={handleChange}
                              errorText={touched.clothingSize ? errors.clothingSize : ""}
                            >
                              {values.clothingType ? (
                                categories[values.clothingType].map((size: string) => (
                                <MenuItem value={size} key={size}>
                                  {t(size)}
                                </MenuItem>
                              ))) : null}
                            </SelectField>
                          </FormControl>
                          <PopoverOnHover message="Some extra information about the field" />
                        </div>
                      </Grid>
                      { touched.coordinates && errors.coordinates ? (
                        <Grid item xs={12}>
                          <Typography color="error">
                            { errors.coordinates }
                          </Typography>
                        </Grid>
                      ) : null}
                    </Grid>

                    {error ? (
                      <Alert severity="error">{error}</Alert>
                    ) : null}
                    <div className={classes.formSubmitActions}>
                      <Button type="submit" className={classes.buttonOutlined}>
                        {t("back")}
                      </Button>
                      <Button type="submit" className={classes.buttonContained}>
                        {t("next")}
                      </Button>
                    </div>
                  </Form>

                </Grid>
              </Grid>
            </div>
          );
        }}
      </Formik>
    </>
  );
};

export default NewChainLocation;
