import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMapGL, { MapEvent, SVGOverlay, FlyToInterpolator } from "react-map-gl";
import destination from "@turf/destination";
import { Form, Formik } from "formik";

// Material UI
import { Button, FormControl, makeStyles, MenuItem, Select, Typography, InputLabel } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

// Project resources
import theme from "../util/theme";
import Geocoding from "./Geocoding";
// import { TwoColumnLayout } from "../components/Layouts";
import { IChain, IViewPort } from "../types";
import { number } from "yup/lib/locale";
import { TextForm, NumberField } from "../components/FormFields";
import ProgressBar from "../components/ProgressBar"
import SizesDropdown from "../components/SizesDropdown";
import FormActions from "../components/formActions";
import categories from "../util/categories";
import PopoverOnHover from "../components/Popover";

const accessToken = process.env.REACT_APP_MAPBOX_KEY || '';

type Coordinates = {
  longitude: number;
  latitude: number;
};

const NewChainLocation = () => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();
  const history = useHistory();
  const [loopLocation, setLoopLocation] = useState<Coordinates | null>(null);
  const [viewport, setViewport] = useState<IViewPort>({
    longitude: 0,
    latitude: 0,
    width: "40vw",
    height: "40vh",
    zoom: 1,
  });
  const [loopRadius, setLoopRadius] = useState<number>(3);
  const [clothingType, setClothingType] = useState<string>('');
  const [clothingSize, setClothingSize] = useState<string>('');

  const handleClothingTypeChange = (event: any) => {
    const newType = event.target.value;
    if ( newType && ! categories[newType].includes(clothingSize)) {
      setClothingSize('');
    }
    setClothingType(newType);
  }

  const redrawLoop = ({ project }: {project: any}) => {
    const centerCoords = [loopLocation!.longitude, loopLocation!.latitude];
    const [centerX, centerY] = project(centerCoords);
    // get the coordinates of a point the right distance away from center
    const boundaryPoint = destination(
      centerCoords,
      loopRadius,
      0,  // due north
      {units: "kilometers"},
    );
    const [_, boundaryY] = project(boundaryPoint.geometry.coordinates);
    const radius = centerY - boundaryY;

    return (
      <>
        <defs>
            <radialGradient id="feather">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.4" />
                <stop offset="50%" stopColor={theme.palette.primary.main} stopOpacity="0.4"/>
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0"/>
            </radialGradient>
        </defs>
        <circle cx={centerX} cy={centerY} r={radius} fill="url(#feather)" />;
      </>
    );
  };

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

  const handleMapClick = (evt: MapEvent) => {
    const longitude = evt.lngLat[0];
    const latitude = evt.lngLat[1];
    setLoopLocation({ longitude: longitude, latitude: latitude });
    flyToLocation(longitude, latitude);
  };

  return (
    <>
      <Helmet>
        <title>Clothing Loop | Create New Loop</title>
        <meta name="description" content="Create New Loop" />
      </Helmet>
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
      >
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
                Click on the map to set the approximate location of the loop
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Geocoding onResult={handleGeolocationResult} />
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
                {loopLocation !== null ? (
                  <SVGOverlay redraw={redrawLoop} />
                ) : null}
              </ReactMapGL>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Form >
                <Grid container>
                  <Grid item xs={9}>
                    <TextForm
                      required
                      label="Loop name"
                      name="loopName"
                      type="text"
                      className={classes.textField}
                      helperText=""
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <NumberField
                      required
                      label="Radius (km)"
                      name="radius"
                      value={loopRadius}
                      className={classes.textField}
                      step={0.1}
                      onChange={(e: any) => {setLoopRadius(e.target.value)}}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextForm
                      required
                      label="Description"
                      name="description"
                      className={classes.textField}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <div className={classes.formFieldWithPopover}>
                      <FormControl fullWidth>
                        <InputLabel id="clothingTypeLabel">
                          Select a clothing type
                        </InputLabel>
                        <Select
                          value={clothingType}
                          labelId="clothingTypeLabel"
                          onChange={handleClothingTypeChange}
                        >
                          {Object.keys(categories).map((category: string) => (
                            <MenuItem value={category} key={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <PopoverOnHover message="Some extra information about the field" />
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div className={classes.formFieldWithPopover}>
                      <FormControl fullWidth>
                        <InputLabel id="clothingSizeLabel">
                          Select a clothing size
                        </InputLabel>
                        <Select
                          value={clothingSize}
                          labelId="clothingsizeLabel"
                          onChange={(e: any) => {setClothingSize(e.target.value)}}
                        >
                          {clothingType ? (
                            categories[clothingType].map((size: string) => (
                            <MenuItem value={size} key={size}>
                              {size}
                            </MenuItem>
                          ))) : null}
                        </Select>
                      </FormControl>
                      <PopoverOnHover message="Some extra information about the field" />
                    </div>
                  </Grid>
                </Grid>

                <div className={classes.formSubmitActions}>
                  <Button
                    type="submit"
                    className={classes.buttonOutlined}
                  >
                    {" "}
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
      </Formik>
    </>
  );
};

export default NewChainLocation;
