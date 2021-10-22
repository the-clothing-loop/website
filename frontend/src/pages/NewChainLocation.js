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
import categories from "../util/categories";

// Material
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import { Helmet } from "react-helmet";
import { TextForm } from "../components/FormFields";
import { Alert } from "@material-ui/lab";
import { CardContent } from "@material-ui/core";

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};

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

  const { userId } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sizes, setSizes] = useState([]);
  const [genders, setGenders] = useState([]);

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
      width: "80vw",
      height: "70vh",
      zoom: 1,
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewport({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          width: "80vw",
          height: "70vh",
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

    setShowPopup(true);

    if (!showPopup) {
      setLocation({ longitude: longitude, latitude: latitude });
      setMarker({ longitude: longitude, latitude: latitude, visible: true });
      getLocation(longitude, latitude);
    }
  };

  //set new chain categories
  const handleCheck = (e, categories, setCategories) => {
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
      categories: { gender: genders, size: sizes },
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
        <title>Clothing-Loop | Create New Loop</title>
        <meta name="description" content="Create New Loop" />
      </Helmet>{" "}
      <div style={{ padding: "1% 0" }}>
        <Typography variant="h3" align="center">
          {"new clothing loop location"}
        </Typography>
        <Typography component="p" align="center" className="explanatory-text">
          {
            "To select the location of the new clothing loop, please click on the map. Then fill out the required information to best describe the clothing loop and submit."
          }
        </Typography>
      </div>
      <ReactMapGL
        style={{
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
        }}
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
                            <Typography
                              component="p"
                              className="explanatory-text"
                            >
                              {
                                "More information on the new clothing loop:"
                              }
                            </Typography>
                            <TextForm
                              key="name"
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
                              key="description"
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

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Typography
                                component="p"
                                style={{
                                  textAlign: "left",
                                  textTransform: "capitalize",
                                }}
                              >
                                categories
                              </Typography>
                              <Typography
                                component="p"
                                className="explanatory-text"
                                style={{fontSize:'0.875rem'}}
                              >
                                {"multiple categories can be selected"}
                              </Typography>
                              <div style={{ display: "flex", padding: "5% 0" }}>
                                {categories.genders.map((value, i) => (
                                  <div key={value}>
                                    <input
                                      className="map-cat-input"
                                      key={`input-${value}-${i}`}
                                      id={value}
                                      type="checkbox"
                                      name={value}
                                      value={value}
                                      onChange={(e) =>
                                        handleCheck(e, genders, setGenders)
                                      }
                                    ></input>
                                    <label
                                      key={`label-${value}-${i}`}
                                      htmlFor={value}
                                    >
                                      <Typography
                                        variant="body2"
                                        style={{ textAlign: "center" }}
                                      >{`${value}'s clothing`}</Typography>
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div>
                                <Typography
                                  component="p"
                                  style={{
                                    textAlign: "left",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  sizes
                                </Typography>
                                <Typography
                                  component="p"
                                  className="explanatory-text"
                                  style={{fontSize:'0.875rem'}}
                                >
                                  {
                                    "multiple sizes can be selected, standard sizing is S-M-L"
                                  }
                                </Typography>
                                <div
                                  className={"inputs-wrapper"}
                                  style={{ display: "flex", padding: "5% 0" }}
                                >
                                  {categories.sizes.map((value, i) => (
                                    <div key={`wrapper-${i}`}>
                                      <input
                                        className="map-cat-input"
                                        key={`input-${value}-${i}`}
                                        id={value}
                                        type="checkbox"
                                        name={value}
                                        value={value}
                                        onChange={(e) =>
                                          handleCheck(e, sizes, setSizes)
                                        }
                                      ></input>
                                      <label
                                        style={{
                                          textTransform: "uppercase",
                                          width: "40px",
                                          height: "40px",
                                          padding: "0",
                                          textAlign: "center",
                                        }}
                                        key={`label-${value}-${i}`}
                                        htmlFor={value}
                                      >
                                        <Typography
                                          variant="body2"
                                          className="input-label-typography"
                                        >
                                          {value}
                                        </Typography>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {error ? (
                              <Alert severity="error">{error}</Alert>
                            ) : null}
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
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
