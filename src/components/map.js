import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

const Map = () => {
  const mapContainer = useRef();
  const [lng, setLng] = useState(4.9041);
  const [lat, setLat] = useState(52.3676);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    var marker = new mapboxgl.Marker({
      color: "red",
      draggable: true,
    })
      .setLngLat([4.9557, 52.3558])
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
};

export default Map;
