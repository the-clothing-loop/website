// React / plugins
import { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { Redirect, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";

//Project Resources
import { createChain } from "../util/firebase/chain";

// Material
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Checkbox from "@material-ui/core/Checkbox";
import { Helmet } from "react-helmet";
import { CheckboxField, TextForm } from "../components/FormFields";
import { Alert } from "@material-ui/lab";
import { CardContent } from "@material-ui/core";

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};

const categoriesList = [
  { gender: "women" },
  { gender: "men" },
  { gender: "mix" },
];

const NewChainLocation = () => {
  const styles = (theme) => ({
    ...theme.spreadThis,
  });

  const { t } = useTranslation();

  const [viewport, setViewport] = useState([]);
  const [marker, setMarker] = useState([]);
  const [chain, setChain] = useState([]);
  const [location, setLocation] = useState([]);
  const [changePage, setChangePage] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [categories, setCategories] = useState([]);
  const { userId } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  //location details
  const getLocation = async (longitude, latitude) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken.mapboxApiAccessToken}&cachebuster=1618224066302&autocomplete=true&types=locality%2Cplace`
    );
    const data = await response.json();

    setChain({
      locality: data.features[0].place_name,
      place: data.features[0].place_name
        .split(",")
        .slice(1)
        .join(","),
    });
  };

  useEffect(() => {
    setViewport({
      latitude: 0,
      longitude: 0,
      width: "100vw",
      height: "80vh",
      zoom: 1,
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewport({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          width: "100vw",
          height: "80vh",
          zoom: 10,
        });
      },
      (err) => {
        console.error(`Couldn't receive location: ${err.message}`);
      }
    );
  }, []);

  //on click get location and set marker, popup and location info
  const handleClick = async (e) => {
    let longitude = e.lngLat[0];
    let latitude = e.lngLat[1];
    setLocation({ longitude: longitude, latitude: latitude });
    setMarker({ longitude: longitude, latitude: latitude, visible: true });
    getLocation(longitude, latitude);
    setShowPopup(true);
  };

  //set new chain categories
  const handleCheck = (e) => {
    if (e.target.checked) {
      setCategories([...categories, e.target.value]);
    } else {
      setCategories(categories.filter((id) => id !== e.target.value));
    }
  };

  const handleSubmit = async (values) => {
    const newChain = {
      ...values,
      latitude: location.latitude,
      longitude: location.longitude,
      categories: { gender: categories },
      address: chain.locality,
      published: false,
      uid: userId,
    };

    console.log(`creating chain: ${JSON.stringify(newChain)}`);
    try {
      await createChain(newChain);
      setChangePage(false);
    } catch (e) {
      console.error(`Error creating chain: ${JSON.stringify(e)}`);
      setError(e.message);
    }
  };

  const validate = Yup.object({
    name: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
    description: Yup.string()
      .min(2, "Must be more than 2 characters")
      .required("Required"),
  });

  if (submitted) {
    return <Redirect to={`/thankyou`} />;
  }

  return changePage ? (
    <>
      <Helmet>
        <title>Clothing-chain | Create new chain</title>
        <meta name="description" content="Create new chain" />
      </Helmet>{" "}
      <Typography variant="h3" align="center">
        {"select new chain location"}
      </Typography>
      <ReactMapGL
        mapboxApiAccessToken={mapboxgl.accessToken}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        {...viewport}
        {...accessToken}
        onViewportChange={(newView) => setViewport(newView)}
        onClick={handleClick}
      >
        {marker.visible ? (
          <div>
            <Marker
              className={"new-chain"}
              latitude={marker.latitude}
              longitude={marker.longitude}
            >
              {" "}
              <img
                id="marker"
                src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png"
                alt="Map Marker"
              />
            </Marker>
            {showPopup ? (
              <Popup
                latitude={marker.latitude}
                longitude={marker.longitude}
                closeOnClick={false}
                onClose={() => setShowPopup(false)}
                className={"new-chain-popup"}
              >
                <Formik
                  initialValues={{
                    name: "",
                    description: "",
                  }}
                  validationSchema={validate}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Card>
                      <CardActions>
                        <CardContent>
                          <Form className={"new-chain-location-form"}>
                            <Typography variant="h4">
                              {"enter chain information"}
                            </Typography>
                            <TextForm
                              required
                              label="Name"
                              name="name"
                              type="text"
                              error={touched.name && Boolean(errors.name)}
                              helperText={
                                errors.name && touched.name ? errors.name : null
                              }
                            />

                            <TextForm
                              required
                              label="Description"
                              name="description"
                              type="description"
                              error={
                                touched.description &&
                                Boolean(errors.description)
                              }
                              helperText={
                                errors.description && touched.description
                                  ? errors.description
                                  : null
                              }
                            />

                            {categoriesList.map((cat) => (
                              <CheckboxField
                                control={<Checkbox onChange={handleCheck} />}
                                label={cat.gender}
                                value={cat.gender}
                                key={cat.gender}
                                name={cat.gender}
                              />
                            ))}

                            {error ? (
                              <Alert severity="error">{error}</Alert>
                            ) : null}
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              // className={classes.button}
                            >
                              {t("submit")}
                            </Button>
                          </Form>
                        </CardContent>
                      </CardActions>
                    </Card>
                  )}
                </Formik>
              </Popup>
            ) : null}
          </div>
        ) : null}
      </ReactMapGL>
    </>
  ) : (
    <Redirect to="/thankyou" />
  );
};

export default NewChainLocation;
