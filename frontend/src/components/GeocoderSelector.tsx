import { useRef, useEffect } from "react";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useTranslation } from "react-i18next";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY || "";

interface Props {
  onResult: (address: MapboxGeocoder.Result) => any;
  address?: string;
  required?: boolean;
}

export default function GeocoderSelector(props: Props) {
  const { t } = useTranslation();
  const refDiv = useRef<any>();

  useEffect(() => {
    const _geocoder = new window.MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      placeholder: t("enterYourAddress"),
    });

    _geocoder.addTo(refDiv.current);

    if (props.required) {
      (refDiv.current as HTMLDivElement)
        .querySelector("input")
        ?.setAttribute("required", "required");
    }

    _geocoder.on("result", (e: { result: MapboxGeocoder.Result }) => {
      props.onResult(e.result);
    });

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
