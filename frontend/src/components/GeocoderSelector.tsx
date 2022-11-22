import { useState, useCallback, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapGL from "react-map-gl";
// @ts-ignore
import Geocoder from "react-map-gl-geocoder";
import { useTranslation } from "react-i18next";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;

interface Props {
  onResult: (address: any) => any;
  address?: string;
}

export default function GeocoderSelector(props: Props) {
  const [viewport, setViewPort] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2,
  });

  const mapRef = useRef<any>();
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
    <div className="geocoder-wrapper tw-w-full">
      <div className="geocoder-wrapper-2 tw-h-14 tw-px-4">
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
            onResult={useCallback((result) => props.onResult(result), [])}
            mapRef={mapRef}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            position="top-left"
            placeholder={
              props.address ? props.address : t("enterYourAddress") + "*"
            }
            address={props.address}
          />
        </MapGL>
      </div>
      <div />
    </div>
  );
}
