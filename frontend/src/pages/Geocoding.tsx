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
  first?: GeoJSON.Position;
}

interface Props {
  onResult: (e: Estimate) => void;
  onSelectResult: () => void;
  initialAddress?: string;
  className?: string;
  types: MapboxType[];
  placeholder?: string;
}

export default function Geocoding(props: Props) {
  const geoRef = useRef<any>();

  useEffect(() => {
    let geocoder: MapboxGeocoder;
    if (MAPBOX_TOKEN) {
      geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        placeholder: props.placeholder,
        types: props.types.join(","), //"country,region,place,postcode,locality,neighborhood",
      });

      if (geoRef) {
        geocoder.addTo(geoRef.current);
      }
      if (props.initialAddress) {
        const input = (geoRef.current as HTMLElement)?.querySelector("input");
        if (input) input.value = props.initialAddress;
      }

      // Add geocoder result to container.
      geocoder.on("result", (e: { result: MapboxGeocoder.Result }) => {
        props.onResult({
          query: e.result.place_name,
          first: e.result.geometry.coordinates,
        });
        props.onSelectResult();
      });

      geocoder.on("results", (e: MapboxGeocoder.Results) => {
        props.onResult({
          query: (e as any)?.config.query || "",
          first: e.features[0]?.geometry.coordinates,
        });
      });

      geocoder.on("clear", () => {
        props.onResult({
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
