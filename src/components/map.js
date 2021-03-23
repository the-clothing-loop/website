import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import getChains from "../util/firebase/chain";

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

const Map = () => {
  //map config
  const mapContainer = useRef();

  useEffect(async () => {
    let chainData = await getChains();

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [5.2913, 52.1326],
      zoom: 8,
    });

    chainData.forEach((chain) => {
      let chainLatitude = chain.latLon.latitude;
      let chainLongitude = chain.latLon.longitude;
      let chainName = chain.name;

      var popup = new mapboxgl.Popup({
        offset: 25,
        className: "chain-popup",
      }).setHTML(
        `<h1>${chainName}</h1><p>description of the chain here</p><button>sign up here</button>`
      );

      var marker = new mapboxgl.Marker({
        color: "red",
        draggable: true,
      })
        .setLngLat([chainLongitude, chainLatitude])
        .setPopup(popup)
        .addTo(map);
    });
  }, []);

  return (
    <div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
};

export default Map;
