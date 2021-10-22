import { useState, useRef, useCallback } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapGL from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";

//material UI
import Typography from "@material-ui/core/Typography";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;

const GeocoderSelector = ({ onResult, ...props }) => {
  const [viewport, setViewPort] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2,
  });

  const mapRef = useRef();

  const handleViewportChange = useCallback(
    (newViewport) => setViewPort(newViewport),
    []
  );

  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides,
      });
    },
    [handleViewportChange]
  );

  return (
    <div>
      <div style={{ height: "50vh", padding: "5% 0" }}>
        <Typography
          className="form-text"
          component="p"
          className="explanatory-text"
          style={{textAlign:'left'}}
        >
          {" "}
          {"Please enter your address using the search bar below:"}
        </Typography>
        <MapGL
          mapStyle="mapbox://styles/mapbox/streets-v11"
          ref={mapRef}
          {...viewport}
          width="100%"
          height="100%"
          onViewportChange={handleViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <Geocoder
            onResult={useCallback((result) => onResult(result), [])}
            mapRef={mapRef}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            position="top-left"
          />
        </MapGL>
      </div>
      <div style={{ height: "50px" }} />
    </div>
  );
};

export default GeocoderSelector;
