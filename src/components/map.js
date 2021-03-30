import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { getChains } from "../util/firebase/chain";
import { useHistory } from "react-router-dom";
import { Button } from "@material-ui/core";

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

const Map = () => {
  const history = useHistory();

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
          <div className={"chain-popup"}>
            <h2>{selectedChain.name}</h2>
            <p>description of the chain here</p>
            <Button
              onClick={(e) => {
                e.preventDefault();
                history.replace(`./signup/?chain=${selectedChain.name}`);
              }}
            >
              Sign up{" "}
            </Button>
          </div>
        </Popup>
      ) : null}
    </ReactMapGL>
  );
};

export default Map;
