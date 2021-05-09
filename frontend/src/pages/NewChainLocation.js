// React / plugins
import { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { Redirect } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { useTranslation } from "react-i18next";

//Project Resources
import { addChain } from "../util/firebase/chain";
import getUserLocation from "../util/api";

// Material
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core";
import theme from "../util/theme";

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
  ipinfoApiAccessToken: process.env.REACT_APP_IPINFO_API_KEY,
};

const NewChainLocation = (props) => {
  const styles = (theme) => ({
    ...theme.spreadThis,
  });

  const { t } = useTranslation();
  const classes = makeStyles(theme)();

  const [viewport, setViewport] = useState([]);
  const [marker, setMarker] = useState([]);
  const [chain, setChain] = useState([]);
  const [location, setLocation] = useState([]);
  const [changePage, setChangePage] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [description, setDescription] = useState("");

  //location details
  const getLocation = async (longitude, latitude) => {
    await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken.mapboxApiAccessToken}&cachebuster=1618224066302&autocomplete=true&types=locality%2Cplace`
    )
      .then((response) => response.json())
      .then((data) => {
        setChain({
          locality: data.features[0].place_name.split(",")[0],
          place: data.features[0].place_name
            .split(",")
            .slice(1)
            .join(","),
        });
      });
  };

  useEffect(() => {
    getUserLocation(accessToken.ipinfoApiAccessToken).then((response) => {
      setViewport({
        latitude: Number(response.loc.split(",")[0]),
        longitude: Number(response.loc.split(",")[1]),
        width: "100%",
        height: 600,
        zoom: 10,
      });
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
  const handleSubmit = (e) => {
    e.preventDefault();

    const newChain = {
      latLon: {
        longitude: location.longitude,
        latitude: location.latitude,
      },
      name: chain.locality,
      description: description,
    };
    // addChain(newChain);
    setChangePage(false);
  };

  //set new chain description
  const handleChange = (e) => {
    setDescription(e.target.value);
    console.log(description);
  };

  return changePage ? (
    <Grid container>
      <Grid item xs></Grid>
      <Grid item xs={6}>
        <Typography variant="h3" className={classes.pageTitle}>
          {t("select new chain location")}
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
                  className={'new-chain-popup'}
                >
                  <Card className={styles.root}>
                    <CardContent>
                      <Typography
                        className={styles.title}
                        color="textPrimary"
                        component="h1"
                        variant='h5'
                        gutterBottom
                      >
                        {chain.locality}
                      </Typography>
                      <Typography
                        className={styles.title}
                        color="textPrimary"
                        component="h1"
                        variant='caption'
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
      </Grid>
      <Grid item xs></Grid>
    </Grid>
  ) : (
    <Redirect to="/newchain-signup" />
  );
};

export default NewChainLocation;
