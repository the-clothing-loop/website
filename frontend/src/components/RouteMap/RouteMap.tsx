import mapboxjs from "mapbox-gl";
import { useEffect, useState } from "react";
import { routeCoordinates } from "../../api/route";
import { UID } from "../../api/types";
import type { Position, Polygon } from "geojson";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

export default function RouteMap(props: {
  centerLongitude: number;
  centerLatitude: number;
  chainUID: UID;
}) {
  const [map, setMap] = useState<mapboxjs.Map | null>(null);
  const [id] = useState(() => window.crypto.randomUUID());
  useEffect(() => {
    const _map = new mapboxjs.Map({
      container: id,
      accessToken: MAPBOX_TOKEN,
      style: "mapbox://styles/mapbox/light-v11",
      center: [props.centerLongitude, props.centerLatitude],
      zoom: 9,
    });
    setMap(_map);

    _map.on("load", () => {
      setRoute(_map);
    });

    return () => {
      _map?.remove();
    };
  }, []);

  async function setRoute(_map: mapboxjs.Map) {
    const coords = (await routeCoordinates(props.chainUID)).data;
    const lastCoord = coords[coords.length - 1];
    _map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates:
            coords.length > 2
              ? [
                  [
                    ...coords.map(
                      (coord) => [coord.longitude, coord.latitude] as Position
                    ),
                    [lastCoord.longitude, lastCoord.latitude],
                  ],
                ]
              : [],
        } as Polygon,
      },
    } as any);

    _map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {},
      paint: {
        "line-color": "#000",
        "line-width": 3,
      },
    });
  }

  return <div id={id} className="w-full h-full"></div>;
}
