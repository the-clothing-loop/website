import { useState, useCallback, useRef, useEffect } from "react";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useTranslation } from "react-i18next";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY || "";

interface Props {
  onResult: (address: any) => any;
  address?: string;
}

export default function GeocoderSelector(props: Props) {
  const mapRef = useRef<any>();
  const { t } = useTranslation();
  const refDiv = useRef<any>();
  // const [geocoder, setGeocoder] = useState<MapboxGeocoder>();

  useEffect(() => {
    const _geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      placeholder: t("enterYourAddress"),
    });

    _geocoder.addTo(refDiv.current);

    // setGeocoder(_geocoder);
    return () => {
      _geocoder.clear();
    };
  }, []);

  return (
    <div className="relative z-20" ref={refDiv}>
      {/* <input
        type="text"
        className="input input-secondary"
        placeholder={
          props.address ? props.address : t("enterYourAddress") + "*"
        }
      /> */}
      {/* <input
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
            address={props.address}
          />
        </MapGL>
      </div>
      <div /> */}
    </div>
  );
}
