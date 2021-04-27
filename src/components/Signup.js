// React / plugins
import { useState, useRef, useCallback, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import MuiPhoneInput from "material-ui-phone-number";

// Mapbox
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapGL from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import DeckGL, { GeoJsonLayer } from "deck.gl";

// Material UI
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

// Project resources
import AppIcon from "../images/sfm_logo.png";
import { addUser, validateNewUser } from "../util/firebase/user";
import StyledTextField from "./TextField";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;

const Signup = (redirectTo) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit } = useForm();
  const classes = makeStyles(theme.form)();
  const [viewport, setViewPort] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2,
    transitionDuration: 100,
  });

  const [searchResultLayer, setSearchResult] = useState(null);

  const mapRef = useRef();

  const handleGeocoderViewportChange = (viewport) => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };
    console.log("Updating");

    return setViewPort({
      ...viewport,
      ...geocoderDefaultOverrides,
    });
  };

  const handleOnResult = (event) => {
    console.log(event.result);
    setSearchResult(
      new GeoJsonLayer({
        id: "search-result",
        data: event.result.geometry,
        getFillColor: [255, 0, 0, 128],
        getRadius: 1000,
        pointRadiusMinPixels: 10,
        pointRadiusMaxPixels: 10,
      })
    );
  };

  const onSubmit = async (user) => {
    // TODO: do something with validation info for new user (e.g. display this)
    const userValid = await validateNewUser(user.email);
    addUser(user);
    setSubmitted(true);
  };

  let signupForm = (
    <Grid container className={classes.form}>
      <Grid item sm />
      <Grid item sm>
        <img
          src={AppIcon}
          alt="SFM logo"
          width="200"
          className={classes.image}
        />
        <Typography variant="h3" className={classes.pageTitle}>
          {t("signup")}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StyledTextField fieldName="name" inputRef={register} email={false} />
          <StyledTextField fieldName="email" inputRef={register} email={true} />
          <MuiPhoneInput
            defaultCountry="nl"
            fullWidth
            label={t("phoneNumber")}
            required={true}
          />
          <div style={{ height: "50vh" }}>
            <p style={{ textAlign: "left", marginTop: "30px" }}>
              {"Please enter your address:"}
            </p>
            <MapGL
              mapStyle="mapbox://styles/mapbox/streets-v11"
              ref={mapRef}
              {...viewport}
              width="100%"
              height="100%"
              onViewportChange={setViewPort}
              mapboxApiAccessToken={MAPBOX_TOKEN}
            >
              <Geocoder
                // onResult={handleOnResult}
                mapRef={mapRef}
                onViewportChange={handleGeocoderViewportChange}
                mapboxApiAccessToken={MAPBOX_TOKEN}
                position="top-left"
              />
            </MapGL>
            <DeckGL {...viewport} layers={[searchResultLayer]} />
          </div>

          <FormGroup row>
            <FormControlLabel
              control={<Checkbox name="checkedActions" inputRef={register} />}
              label={t("actions")}
            />
            <FormControlLabel
              control={
                <Checkbox name="checkedNewsletter" inputRef={register} />
              }
              label={t("newsletter")}
            />
          </FormGroup>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            {t("signup")}
          </Button>
        </form>
      </Grid>
      <Grid item sm />
    </Grid>
  );

  if (submitted) {
    return <Redirect to={redirectTo} />;
  } else {
    return signupForm;
  }
};

export default Signup;
