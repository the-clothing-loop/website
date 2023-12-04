import { useState } from "react";

export function circleRadiusKm(meters: number, latitude: number): number {
  return meters / 0.075 / Math.cos((latitude * Math.PI) / 180);
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
