import mapboxjs, { type Map } from "mapbox-gl";
import { useEffect, useState } from "react";
import { type RouteCoordinate, routeCoordinates } from "../../api/route";
import type { Chain, UID } from "../../api/types";
import type { FeatureCollection, Polygon, Feature } from "geojson";
import { useMapZoom } from "./utils";

import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import {
  addOutline,
  ellipseOutline,
  gitCommitOutline,
  removeOutline,
} from "ionicons/icons";

type LineType = "mixed" | "line" | "dot";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;
const MAX_ZOOM = 16;
const MAX_ZOOM_HOST = 18;
const MIN_ZOOM = 4;
const KEY_ROUTE_MAP_LINE = "route_map_line";

export default function RouteMap(props: {
  chain: Chain;
  authUserUID: UID;
  isChainAdmin: boolean;
}) {
  const [map, setMap] = useState<Map>();
  const { zoom, setZoom, mapZoom } = useMapZoom(11, MIN_ZOOM, MAX_ZOOM);
  const [id] = useState(() => window.crypto.randomUUID());
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
      maxZoom: props.isChainAdmin ? MAX_ZOOM_HOST : MAX_ZOOM,
    });
    setZoom(11);
    _map.on("load", () => {
      (async () => {
        _map.on("zoomend", (e) => {
          setZoom(e.target.getZoom());
        });

        const coords = await routeCoordinates(
          props.chain.uid,
          props.authUserUID,
        ).then((res) => {
          return res.data.map((item, i) => {
            (item as SortedCoordinate).route_index = i;
            return item;
          }) as SortedCoordinate[];
        });
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

  let lineTypeIcon = gitCommitOutline;
  if (lineType === "line") {
    lineTypeIcon = removeOutline;
  } else if (lineType === "dot") {
    lineTypeIcon = ellipseOutline;
  }
  return (
    <div className="tw-w-full tw-h-full tw-relative">
      <IonFab className="tw-mb-16" horizontal="end" vertical="bottom">
        <IonFabButton size="small" onClick={() => handleNextLineType()}>
          <IonIcon icon={lineTypeIcon} />
        </IonFabButton>
        <IonFabButton
          size="small"
          color="light"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => handleMapZoom("+")}
        >
          <IonIcon icon={addOutline} />
        </IonFabButton>
        <IonFabButton
          size="small"
          color="light"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => handleMapZoom("-")}
        >
          <IonIcon icon={removeOutline} />
        </IonFabButton>
      </IonFab>
      <div id={id} className="tw-w-full tw-h-full"></div>
    </div>
  );
}

interface SortedCoordinate extends RouteCoordinate {
  route_index: number;
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

function mapToGeoJSONPolygonCoords(coords: RouteCoordinate[]): Feature {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords.map((coord) => [coord.longitude, coord.latitude])],
    } as Polygon,
    properties: {},
  };
}
