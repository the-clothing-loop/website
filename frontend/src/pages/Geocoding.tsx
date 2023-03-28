import { useEffect, useMemo, useRef, useState } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useTranslation } from "react-i18next";

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
  const { i18n } = useTranslation();
  const [geocoder, setGeocoder] = useState<MapboxGeocoder>();

  useEffect(() => {
    if (MAPBOX_TOKEN) {
      const _geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        placeholder: props.placeholder,
        types: props.types.join(","), //"country,region,place,postcode,locality,neighborhood",
      });

      if (geoRef) {
        _geocoder.addTo(geoRef.current);
      }
      if (props.initialAddress) {
        const input = (geoRef.current as HTMLElement)?.querySelector("input");
        if (input) input.value = props.initialAddress;
      }

      // Add geocoder result to container.
      _geocoder.on("result", (e: { result: MapboxGeocoder.Result }) => {
        props.onResult({
          query: e.result.place_name,
          first: e.result.geometry.coordinates,
        });
        props.onSelectResult();
      });

      _geocoder.on("results", (e: MapboxGeocoder.Results) => {
        props.onResult({
          query: (e as any)?.config.query || "",
          first: e.features[0]?.geometry.coordinates,
        });
      });

      _geocoder.on("clear", () => {
        props.onResult({
          query: "",
          first: undefined,
        });
      });
      setGeocoder(_geocoder);
    }

    return () => {
      geocoder?.clear();
    };
  }, []);

  useMemo(() => {
    if (geocoder && props.placeholder)
      geocoder.setPlaceholder(props.placeholder);
  }, [i18n.language]);

  return <div className={props.className} ref={geoRef}></div>;
}
