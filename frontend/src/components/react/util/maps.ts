import { useState } from "react";

// Chain radii have historically been stored at four times the value hosts see.
const LEGACY_CHAIN_RADIUS_SCALE = 4;

export function circleRadiusKm(meters: number, latitude: number): number {
  return meters / 0.075 / Math.cos((latitude * Math.PI) / 180);
}

export function chainRadiusKm(storedRadius: number): number {
  return storedRadius / LEGACY_CHAIN_RADIUS_SCALE;
}

export function distanceKm(
  from: GeoJSON.Position,
  to: { latitude: number; longitude: number },
): number {
  const earthRadiusKm = 6371;
  const fromLat = (from[GEOJSON_LATITUDE_INDEX]! * Math.PI) / 180;
  const toLat = (to.latitude * Math.PI) / 180;
  const deltaLat = toLat - fromLat;
  const deltaLng =
    ((to.longitude - from[GEOJSON_LONGITUDE_INDEX]!) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useMapZoom(initZoom: number, minZoom: number, maxZoom: number) {
  const [zoom, setZoom] = useState(initZoom);

  function mapZoom(map: mapboxgl.Map | undefined, o: "+" | "-") {
    if (!map) return;
    let z = map.getZoom() || initZoom;
    switch (o) {
      case "+":
        if (z < maxZoom) {
          console.log("z", z + 1);
          map.setZoom(z + 1);
        }
        break;
      case "-":
        if (z > minZoom) {
          console.log("z", z - 1);
          map.setZoom(z - 1);
        }
        break;
    }
  }

  return { zoom, setZoom, mapZoom };
}

export const GEOJSON_LATITUDE_INDEX = 1;
export const GEOJSON_LONGITUDE_INDEX = 0;

export function CoordsFromMapbox(o: [number, number] | number[]): {
  latitude: number;
  longitude: number;
} {
  return {
    latitude: o[GEOJSON_LATITUDE_INDEX],
    longitude: o[GEOJSON_LONGITUDE_INDEX],
  };
}
