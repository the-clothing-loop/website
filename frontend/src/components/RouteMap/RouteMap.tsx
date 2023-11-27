import mapboxjs, { GeoJSONSource } from "mapbox-gl";
import { useEffect, useState } from "react";
import { RouteCoordinate, routeCoordinates } from "../../api/route";
import { Chain, UID } from "../../api/types";
import type { FeatureCollection, Polygon, Feature } from "geojson";
import { useDebouncedCallback } from "use-debounce";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

export default function RouteMap(props: { chain: Chain; route: UID[] }) {
  const [map, setMap] = useState<mapboxjs.Map | null>(null);
  const [id] = useState(() => window.crypto.randomUUID());
  useEffect(() => {
    const _map = new mapboxjs.Map({
      container: id,
      accessToken: MAPBOX_TOKEN,
      style: "mapbox://styles/mapbox/light-v11",
      center: [props.chain.longitude, props.chain.latitude],
      zoom: 11,
    });
    setMap(_map);

    _map.on("load", () => {
      (async () => {
        const coords = (await routeCoordinates(props.chain.uid)).data;
        _map.addSource("route", {
          type: "geojson",
          data: mapToGeoJSONCoords(coords, props.route),
        });

        _map.addSource("route-poly", {
          type: "geojson",
          data: mapToGeoJSONPolygonCoords(coords, props.route),
        });

        _map.addLayer({
          id: "outline",
          type: "line",
          source: "route-poly",
          layout: {},
          paint: {
            "line-color": ["rgba", 0, 0, 0, 0.4],
            "line-width": 2,
          },
        });

        _map.addLayer({
          id: "point-bg",
          type: "circle",
          source: "route",
          paint: {
            "circle-color": "#f1bb87", //["rgba", 239, 149, 61, 0.6], // #ef953d
            "circle-radius": 15,
            "circle-stroke-width": 0,
          },
        });

        _map.addLayer({
          id: "point-text",
          type: "symbol",
          source: "route",
          layout: {
            "text-field": ["get", "route_order"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });
      })();
    });

    return () => {
      _map?.remove();
    };
  }, []);

  const debouncedUpdateSource = useDebouncedCallback(
    async () => {
      const routeSource = map!.getSource("route") as GeoJSONSource;
      const routePolySource = map!.getSource("route-poly") as GeoJSONSource;
      if (!routeSource) return;
      const coords = (await routeCoordinates(props.chain.uid)).data;
      routeSource.setData(mapToGeoJSONCoords(coords, props.route));
      routePolySource.setData(mapToGeoJSONPolygonCoords(coords, props.route));
    },
    2e3,
    {}
  );
  useEffect(() => {
    console.log("Loading", map === null ? "map is null" : "map exists");

    if (!map) return;
    debouncedUpdateSource();
  }, [props.chain, props.route]);

  return <div id={id} className="w-full h-full"></div>;
}

function mapToGeoJSONCoords(
  coords: RouteCoordinate[],
  route: UID[]
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: coords.map((coord) => {
      const route_order = route.indexOf(coord.user_uid) + 1;
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coord.longitude, coord.latitude],
        },
        properties: {
          uid: coord.user_uid,
          route_order,
        },
      };
    }),
  };
}

function mapToGeoJSONPolygonCoords(
  coords: RouteCoordinate[],
  route: UID[]
): Feature {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords.map((coord) => [coord.longitude, coord.latitude])],
    } as Polygon,
    properties: {},
  };
}
