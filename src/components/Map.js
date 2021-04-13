import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useTranslation } from "react-i18next";

// Material UI
import { Button } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

// Project resources
import { getChains } from "../util/firebase/chain";

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

const Map = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const styles = (theme) => ({
    ...theme.spreadThis,
  });

  const [viewport, setViewport] = useState({
    latitude: 52.1326,
    longitude: 5.2913,
    zoom: 8,
    width: "100vw",
    height: "100vh",
  });



  const [chainData, setChainData] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    getChains().then((response) => {
      console.log(response);
      setChainData(response);
    });
  }, []);

  return (
    <ReactMapGL
      mapboxApiAccessToken={mapboxgl.accessToken}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      {...viewport}
      onViewportChange={(newView) => setViewport(newView)}
    >
      {chainData.map((chain) => (
        <Marker
          key={chain.name}
          latitude={chain.latLon.latitude}
          longitude={chain.latLon.longitude}
          onClick={(e) => {
            e.preventDefault();
            setSelectedChain(chain);
            setShowPopup(true);
          }}
        >
          {" "}
          <img
            id="marker"
            src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png"
            alt="Map Marker"
          />
        </Marker>
      ))}

      {selectedChain && showPopup ? (
        <Popup
          latitude={selectedChain.latLon.latitude}
          longitude={selectedChain.latLon.longitude}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
          dynamicPosition={false}
        >
          <Card className={styles.root}>
            <CardContent>
              <Typography
                className={styles.title}
                color="secondary.dark"
                component="p"
                variant="h4"
                gutterBottom
              >
                {selectedChain.name}
              </Typography>
              <Typography
                variant="body2"
                component="p"
                className={"chain-address"}
              >
                {selectedChain.address}
              </Typography>
              <Typography variant="body2" component="p">
                {selectedChain.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  history.replace(`./signup/?chain=${selectedChain.name}`);
                }}
              >
                {t("signup")}
              </Button>{" "}
            </CardActions>
          </Card>
        </Popup>
      ) : null}
    </ReactMapGL>
  );
};

export default Map;
