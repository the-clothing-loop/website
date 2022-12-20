import react, { useEffect, useRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

type MapboxType =
  | "country"
  | "region"
  | "postcode"
  | "district"
  | "place"
  | "locality"
  | "neighborhood"
  | "address"
  | "poi"
  | "poi.landmark";

export interface Estimate {
  query: string;
  first?: MapboxGeocoder.Result;
}

interface Props {
  onResult: (event: MapboxGeocoder.Result) => void;
  onEstimate?: (estimate: Estimate) => void;
  initialAddress?: string;
  className?: string;
  types: MapboxType[];
}

export default function Geocoding(props: Props) {
  const geoRef = useRef<any>();

  useEffect(() => {
    let geocoder: MapboxGeocoder;
    if (MAPBOX_TOKEN) {
      geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        types: props.types.join(","), //"country,region,place,postcode,locality,neighborhood",
      });

      if (geoRef) {
        geocoder.addTo(geoRef.current);
      }

      // Add geocoder result to container.
      geocoder.on("result", (e: { result: MapboxGeocoder.Result }) => {
        props.onResult(e.result);
      });

      if (props.initialAddress) {
        geocoder.setInput(props.initialAddress);
      }

      geocoder.on("results", (e: MapboxGeocoder.Results) => {
        props.onEstimate &&
          props.onEstimate({
            query: e.query.at(0) || "",
            first: e.features.at(0) as MapboxGeocoder.Result,
          });
      });

      geocoder.on("clear", () => {
        props.onEstimate &&
          props.onEstimate({
            query: "",
            first: undefined,
          });
      });
    }

    return () => {
      geocoder?.clear();
    };
  }, []);

  return <div className={props.className} ref={geoRef}></div>;
}
