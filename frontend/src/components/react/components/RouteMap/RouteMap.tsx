import mapboxjs, { GeoJSONSource } from "mapbox-gl";
import { useEffect, useState } from "react";
import { type RouteCoordinate, routeCoordinates } from "../../../../api/route";
import type { Chain, UID } from "../../../../api/types";
import type { FeatureCollection, Polygon, Feature } from "geojson";
import { useDebouncedCallback } from "use-debounce";
import { useMapZoom } from "../../util/maps";
import { useTranslation } from "react-i18next";

type LineType = "mixed" | "line" | "dot";

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_KEY;
const MAX_ZOOM = 18;
const MIN_ZOOM = 4;
const KEY_ROUTE_MAP_LINE = "route_map_line";

export default function RouteMap(props: { chain: Chain; route: UID[] }) {
  const [map, setMap] = useState<mapboxjs.Map>();
  const { zoom, setZoom, mapZoom } = useMapZoom(11, MIN_ZOOM, MAX_ZOOM);
  const [id] = useState(() => window.crypto.randomUUID());
  const { t } = useTranslation();
  const [lineType, setLineType] = useState(
    () =>
      (window.localStorage.getItem(KEY_ROUTE_MAP_LINE) || "mixed") as LineType,
  );

  useEffect(() => {
    const _map = new mapboxjs.Map({
      container: id,
      accessToken: MAPBOX_TOKEN,
      style: "mapbox://styles/mapbox/light-v11",
      center: [props.chain.longitude, props.chain.latitude],
      zoom: 11,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    });
    setZoom(11);
    _map.on("load", () => {
      (async () => {
        _map.on("zoomend", (e) => {
          setZoom(e.target.getZoom());
        });

        const coords = await getSortedCoordinates(props.chain.uid, props.route);
        _map.addSource("route", {
          type: "geojson",
          data: mapToGeoJSONCoords(coords),
        });

        _map.addSource("route-poly", {
          type: "geojson",
          data: mapToGeoJSONPolygonCoords(coords),
        });

        const showLine = lineType !== "dot";
        const showDot = lineType !== "line";

        _map.addLayer({
          id: "outline",
          type: "line",
          source: "route-poly",
          paint: {
            "line-color": ["rgba", 0, 0, 0, 0.4],
            "line-width": 1,
          },
          layout: {
            visibility: showLine ? "visible" : "none",
          },
        });

        _map.addLayer({
          id: "point-dot",
          type: "circle",
          source: "route",
          paint: {
            "circle-color": "#909090", // #a899c2
            "circle-radius": 3,
            "circle-stroke-width": 0,
          },
          layout: {
            visibility: lineType === "line" ? "visible" : "none",
          },
        });

        _map.addLayer({
          id: "point-bg",
          type: "circle",
          source: "route",
          paint: {
            "circle-color": "#c2b8d4", // #a899c2
            "circle-radius": 15,
            "circle-stroke-width": 0,
          },
          layout: {
            visibility: showDot ? "visible" : "none",
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
            visibility: showDot ? "visible" : "none",
          },
        });
      })();
    });

    setMap(_map);

    return () => {
      _map?.remove();
    };
  }, []);

  const debouncedUpdateSource = useDebouncedCallback(
    async () => {
      const routeSource = map!.getSource("route") as GeoJSONSource;
      const routePolySource = map!.getSource("route-poly") as GeoJSONSource;
      if (!routeSource) return;
      const coords = await getSortedCoordinates(props.chain.uid, props.route);
      routeSource.setData(mapToGeoJSONCoords(coords));
      routePolySource.setData(mapToGeoJSONPolygonCoords(coords));
    },
    1e3,
    {},
  );
  useEffect(() => {
    if (!map) return;
    debouncedUpdateSource();
  }, [props.chain, props.route]);

  function handleMapZoom(o: "+" | "-") {
    mapZoom(map, o);
  }

  function handleNextLineType() {
    const current = lineType;

    // calculate next line type
    let next: LineType = "mixed";
    if (current === "mixed") next = "line";
    else if (current === "line") next = "dot";

    // set map to line type
    setLineType(next);
    window.localStorage.setItem(KEY_ROUTE_MAP_LINE, next);

    const showLine = next !== "dot";
    const showDot = next !== "line";
    map?.setLayoutProperty(
      "point-text",
      "visibility",
      showDot ? "visible" : "none",
    );
    map?.setLayoutProperty(
      "point-bg",
      "visibility",
      showDot ? "visible" : "none",
    );
    map?.setLayoutProperty(
      "outline",
      "visibility",
      showLine ? "visible" : "none",
    );
    map?.setLayoutProperty(
      "point-dot",
      "visibility",
      next === "line" ? "visible" : "none",
    );
  }

  let lineTypeIcon = "icon-git-commit";
  let lineTypeHoverText = t("showRouteOrder");
  if (lineType === "line") {
    lineTypeIcon = "icon-minus";
    lineTypeHoverText = t("showRoute");
  } else if (lineType === "dot") {
    lineTypeIcon = "icon-circle";
    lineTypeHoverText = t("showAddress");
  }
  return (
    <div className="w-full h-full relative">
      <div id={id} className="w-full h-full"></div>
      <div className="flex flex-col absolute z-30 bottom-8 right-2.5 rtl:right-auto rtl:left-2.5">
        <button
          type="button"
          className={`no-animation btn btn-sm mb-4 p-0 w-8 h-8 glass bg-purple-light/80 hover:bg-purple-light btn-outline tooltip tooltip-left ${
            props.route.length > 1 ? "" : "hidden"
          }`}
          onClick={() => handleNextLineType()}
          data-tip={lineTypeHoverText}
        >
          <span className={`text-base-content text-lg ${lineTypeIcon}`} />
        </button>

        <div className="btn-group btn-group-vertical">
          <button
            type="button"
            className={`btn btn-sm p-0 w-8 h-8 ${
              zoom >= MAX_ZOOM
                ? "btn-disabled bg-white/30"
                : "glass bg-white/60 hover:bg-white/90 btn-outline"
            }`}
            onClick={() => handleMapZoom("+")}
          >
            <span className="icon-plus text-base-content text-lg" />
          </button>
          <button
            type="button"
            className={`btn btn-sm p-0 w-8 h-8 ${
              zoom <= MIN_ZOOM
                ? "btn-disabled bg-white/30"
                : "glass bg-white/60 hover:bg-white/90 btn-outline"
            }`}
            onClick={() => handleMapZoom("-")}
          >
            <span className="icon-minus text-base-content text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}

function mapToGeoJSONCoords(coords: SortedCoordinate[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: coords.map((coord) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coord.longitude, coord.latitude],
        },
        properties: {
          uid: coord.user_uid,
          route_order: coord.route_index + 1,
        },
      };
    }),
  };
}

function mapToGeoJSONPolygonCoords(coords: SortedCoordinate[]): Feature {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords.map((coord) => [coord.longitude, coord.latitude])],
    } as Polygon,
    properties: {},
  };
}

interface SortedCoordinate extends RouteCoordinate {
  route_index: number;
}

function getSortedCoordinates(chainUID: UID, route: UID[]) {
  return routeCoordinates(chainUID).then((res) => {
    const sortedCoords: SortedCoordinate[] = [];
    for (let i = 0; i < route.length; i++) {
      const user_uid = route[i];
      const coord = res.data.find((c) => c.user_uid === user_uid);
      if (!coord) continue;
      sortedCoords.push({
        ...coord,
        route_index: i,
      });
    }
    return sortedCoords;
  });
}
