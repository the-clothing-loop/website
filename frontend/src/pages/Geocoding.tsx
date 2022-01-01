import react, { useState, useEffect, useRef, createRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;

interface IProps {
  onResult: (event: any) => void,
  className?: string,
}

const Geocoding = ({onResult, className}: IProps) => {
  const [address, setAddress] = useState<string>();
  const [results, setResults] = useState({});

  const geoRef = createRef();

  useEffect(() => {
    if (MAPBOX_TOKEN) {
      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        types: "country,region,place,postcode,locality,neighborhood",
      });

      if (geoRef) {
        geocoder.addTo("#geocoding");
        setResults(geocoder);
      }

      // Add geocoder result to container.
      geocoder.on("result", (e: any) => {
        onResult(e);
        setAddress(e.result.place_name);
      });
    }
  }, []);

  return (
    <div
      id="geocoding"
      className={className}
      ref={geoRef as React.RefObject<HTMLDivElement>}
    >
    </div>
  );
};

export default Geocoding;
