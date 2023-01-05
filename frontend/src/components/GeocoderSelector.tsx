import { useRef, useEffect } from "react";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useTranslation } from "react-i18next";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Estimate } from "../pages/Geocoding";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY || "";

interface Props {
  onResult: (e: Estimate) => any;
  address?: string;
  required?: boolean;
}

export default function GeocoderSelector(props: Props) {
  const { t } = useTranslation();
  const refDiv = useRef<any>();

  useEffect(() => {
    const _geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      placeholder: t("enterYourAddress"),
      types: "address",
    });

    _geocoder.addTo(refDiv.current);

    if (props.required) {
      (refDiv.current as HTMLDivElement)
        .querySelector("input")
        ?.setAttribute("required", "required");
    }

    _geocoder.on("result", (e: { result: MapboxGeocoder.Result }) => {
      props.onResult({
        query: e.result.place_name,
        first: e.result.geometry.coordinates,
      });
    });

    _geocoder.on("results", (e: MapboxGeocoder.Results) => {
      props.onResult({
        query: (e as any)?.config.query || "",
        first: e.features[0]?.geometry.coordinates,
      });
    });

    _geocoder.on("clear", () => {
      props.onResult({ query: "", first: undefined });
    });

    return () => {
      _geocoder.clear();
    };
  }, []);

  return <div className="relative z-20" ref={refDiv}></div>;
}
