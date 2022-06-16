import { useState, useCallback, createRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapGL, { MapRef } from "react-map-gl";
// @ts-ignore
import Geocoder from "react-map-gl-geocoder";
import { useTranslation } from "react-i18next";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;

type GeocoderSelectorProps = {
  onResult: (result: any) => any;
  userAddress?: string;
  name?: string;
};

const GeocoderSelector = ({ onResult, ...props }: GeocoderSelectorProps) => {
  const [viewport, setViewPort] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2,
  });

  const mapRef = createRef<MapRef>();
  const { t } = useTranslation();

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
    <div style={{ height: "58px", width: "100%" }} className="geocoder-wrapper">
      <div
        style={{ height: "58px", padding: "2% 0" }}
        className="geocoder-wrapper-2"
      >
        <MapGL
          className="geocoding-map"
          mapStyle="mapbox://styles/mapbox/streets-v11"
          ref={mapRef}
          {...viewport}
          width="100%"
          height="100%"
          onViewportChange={handleViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <Geocoder
            className="address-geocoder"
            onResult={useCallback((result) => onResult(result), [])}
            mapRef={mapRef}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            position="top-left"
            placeholder={
              props.userAddress ? props.userAddress : t("enterYourAddress")
            }
            userAddress={props.userAddress}
          />
        </MapGL>
      </div>
      <div style={{ height: "50px" }} />
    </div>
  );
};

export default GeocoderSelector;
