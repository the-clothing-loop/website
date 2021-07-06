// React / plugins
import { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { Redirect, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { useTranslation } from "react-i18next";

//Project Resources
import { createChain } from "../util/firebase/chain";

// Material
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Helmet } from "react-helmet";

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};

const categories = [
  { gender: "women" },
  { gender: "men" },
  { gender: "no gender" },
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
  const [description, setDescription] = useState("");
  const [chainCategories, setChainCategories] = useState([]);
  const { userId } = useParams();

  //location details
  const getLocation = async (longitude, latitude) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken.mapboxApiAccessToken}&cachebuster=1618224066302&autocomplete=true&types=locality%2Cplace`
    );
    const data = await response.json();
    setChain({
      locality: data.features[0].place_name.split(",")[0],
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
      height: "100vh",
      zoom: 1,
    });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewport({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          width: "100vw",
          height: "100vh",
          zoom: 10,
        });
      },
      (err) => {
        console.error(`Couldn't receive location: ${err.message}`);
      });
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

  //post new chain location/details to db
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newChain = {
      longitude: location.longitude,
      latitude: location.latitude,
      name: chain.locality,
      address: chain.locality,
      description: description,
      categories: { gender: chainCategories },
      uid: userId
    };
    console.log(`creating chain: ${JSON.stringify(newChain)}, ${userId}`);
    await createChain(newChain);
    setChangePage(false);
  };

  //set new chain description
  const handleCheck = (e) => {
    if (e.target.checked) {
      setChainCategories([...chainCategories, e.target.value]);
    } else {
      setChainCategories(chainCategories.filter((id) => id !== e.target.value));
    }
  };

  const handleChange = (e) => {
    setDescription(e.target.value);
  };

  return changePage ? <>
    <Helmet>
      <title>Clothing-chain | Create new chain</title>
      <meta name="description" content="Create new chain"/>
    </Helmet>
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
          <Marker latitude={marker.latitude} longitude={marker.longitude}>
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
              <Card className={styles.root}>
                <CardContent>
                  <Typography
                    className={styles.title}
                    color="textPrimary"
                    component="h1"
                    variant="h5"
                    gutterBottom
                  >
                    {chain.locality}
                  </Typography>
                  <Typography
                    className={styles.title}
                    color="textPrimary"
                    component="h1"
                    variant="caption"
                    gutterBottom
                  >
                    {chain.place}
                  </Typography>
                </CardContent>
                <CardActions>
                  <form onSubmit={handleSubmit}>
                    <TextField
                      id={"description"}
                      name={"description"}
                      type="text"
                      label={t("add description")}
                      onChange={handleChange}
                      fullWidth
                    ></TextField>
                    <FormControl>
                      <FormGroup>
                        {categories.map((cat) => (
                          <FormControlLabel
                            control={<Checkbox onChange={handleCheck} />}
                            label={cat.gender}
                            value={cat.gender}
                            key={cat.gender}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      className={"chain-description"}
                    >
                      {"start chain"}
                    </Button>{" "}
                  </form>
                </CardActions>
              </Card>
            </Popup>
          ) : null}
        </div>
      ) : null}
    </ReactMapGL>
  </> : (
    <Redirect to="/thankyou" />
  );
};

export default NewChainLocation;
