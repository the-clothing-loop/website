import { useEffect, useState, useRef } from "react";

import type * as GeoJSONTypes from "geojson";
import type { MapboxGeoJSONFeature } from "mapbox-gl";

// Project resources
import type { Chain, UID } from "../../../api/types";
import { chainGetAll } from "../../../api/chain";
import SearchBar, {
  type SearchValues,
  toUrlSearchParams,
} from "../components/FindChain/SearchBar";
import Sidebar from "../components/FindChain/Sidebar";
import {
  GEOJSON_LATITUDE_INDEX,
  GEOJSON_LONGITUDE_INDEX,
  circleRadiusKm,
  useMapZoom,
} from "../util/maps";
import { addToastError } from "../../../stores/toast";
import { useStore } from "@nanostores/react";
import { $chains } from "../../../stores/chains";

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_KEY;

const MAX_ZOOM = 13;
const MIN_ZOOM = 3;

export type ChainPredicate = (chain: Chain) => boolean;

type GeoJSONChains = GeoJSONTypes.FeatureCollection<
  GeoJSONTypes.Point,
  {
    uid: UID;
    chainIndex: number;
    radius: number;
    gender: string;
    size: string;
    open_to_new_members: boolean;
    cluster?: boolean;
  }
>;

function mapToGeoJSONChains(
  chains: Chain[],
  filterFunc: (c: Chain) => boolean = () => true,
): GeoJSONChains {
  return {
    type: "FeatureCollection",
    features: chains.filter(filterFunc).map((chain, chainIndex) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [chain.longitude, chain.latitude],
        },
        properties: {
          uid: chain.uid,
          chainIndex: chainIndex,
          radius: circleRadiusKm((chain.radius * 1000) / 6, chain.latitude),
          gender: chain.genders?.join("") || "",
          size: chain.sizes?.join("") || "",
          open_to_new_members: chain.open_to_new_members,
        },
      };
    }),
  };
}

function createFilterFunc(
  genders: string[],
  sizes: string[],
): (c: Chain) => boolean {
  if (!sizes?.length && !genders?.length) return (_: Chain) => true;

  return (c: Chain) => {
    for (let g of genders) {
      if (!c.genders?.includes(g)) {
        return false;
      }
    }
    for (let s of sizes) {
      if (!c.sizes?.includes(s)) {
        return false;
      }
    }

    return true;
  };
}

export default function FindChain() {
  const urlParams = new URLSearchParams(location.search);

  const chains = useStore($chains);
  const [map, setMap] = useState<mapboxgl.Map>();
  const [marker, setMarker] = useState<mapboxgl.Marker>();
  const { zoom, setZoom, mapZoom } = useMapZoom(4, MIN_ZOOM, MAX_ZOOM);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapClickedChains, setMapClickedChains] = useState<Chain[]>([]);
  const [visibleChains, setVisibleChains] = useState<Chain[]>([]);
  const [focusedChain, setFocusedChain] = useState<Chain | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const mapRef = useRef<any>();

  useEffect(() => {
    console.log("MAPBOX_TOKEN", MAPBOX_TOKEN);
    if (!mapRef.current) return;
    const _center = [
      Number.parseFloat(urlParams.get("lo") || ""),
      Number.parseFloat(urlParams.get("la") || ""),
    ];
    const hasCenter = !!(
      _center[GEOJSON_LONGITUDE_INDEX] && _center[GEOJSON_LATITUDE_INDEX]
    );
    const _map = new window.mapboxgl.Map({
      accessToken: MAPBOX_TOKEN,
      container: mapRef.current,
      projection: { name: "mercator" },
      zoom: hasCenter ? 10 : 4,
      minZoom: 1,
      maxZoom: 13,
      center: (hasCenter
        ? _center
        : [4.8998197, 52.3673008]) as mapboxgl.LngLatLike,
      style: "mapbox://styles/mapbox/light-v11",
    });
    const _marker = new window.mapboxgl.Marker({
      color: "#518d7e",
    });

    setZoom(4);

    const clusterMaxZoom = 8;
    chainGetAll({ filter_out_unpublished: true }).then((res) => {
      const _chains = res.data;

      _map.on("zoomend", (e) => {
        setZoom(e.target.getZoom());
      });

      const filterFunc = createFilterFunc(
        urlParams.getAll("g"),
        urlParams.getAll("s"),
      );

      _map.on("load", () => {
        _map.addSource("chains", {
          type: "geojson",
          data: mapToGeoJSONChains(_chains, filterFunc),
          cluster: true,
          clusterMaxZoom: clusterMaxZoom,
          clusterMinPoints: 1,
          clusterRadius: 25,
          clusterProperties: {
            sum_open_to_new_members: [
              "+",
              ["case", ["get", "open_to_new_members"], 1, 0],
            ],
          },
          generateId: true,
        });

        _map.addLayer({
          id: "chain-cluster",
          type: "circle",
          source: "chains",
          filter: ["<=", ["zoom"], clusterMaxZoom],
          paint: {
            "circle-color": [
              "case",
              [
                "any",
                [">", ["coalesce", ["get", "sum_open_to_new_members"], 0], 0],
                [
                  "all",
                  ["<", ["coalesce", ["get", "point_count_abbreviated"], 0], 2],
                  ["has", "open_to_new_members"],
                  ["get", "open_to_new_members"],
                ],
              ],
              ["rgba", 239, 149, 61, 0.6], // #ef953d
              ["rgba", 0, 0, 0, 0.1], // grey
            ],
            "circle-radius": 15,
            "circle-stroke-width": 0,
          },
        });

        _map.addLayer({
          id: "chain-cluster-count",
          type: "symbol",
          source: "chains",
          filter: ["<=", ["zoom"], clusterMaxZoom],
          layout: {
            "text-field": ["coalesce", ["get", "point_count_abbreviated"], "1"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });
        _map.addLayer({
          id: "chain-single",
          type: "circle",
          source: "chains",
          filter: [">", ["zoom"], clusterMaxZoom],
          paint: {
            "circle-color": [
              "case",
              ["==", ["feature-state", "clicked"], true],
              ["rgba", 81, 141, 126, 0.4],
              [
                "case",
                ["get", "open_to_new_members"],
                ["rgba", 240, 196, 73, 0.4], // #f0c449
                ["rgba", 0, 0, 0, 0.1],
              ],
            ],
            "circle-radius": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              0,
              0,
              20,
              ["get", "radius"],
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": [
              "case",
              ["==", ["feature-state", "clicked"], true],
              ["rgba", 72, 128, 139, 0.4],
              [
                "case",
                ["get", "open_to_new_members"],
                ["rgba", 240, 196, 73, 0.4], // #f0c449
                ["rgba", 0, 0, 0, 0.1],
              ],
            ],
          },
        });

        // Initalize chainsInView
        _map.on("idle", () => {
          console.info("idle");
          const visibleChains = getVisibleChains(_map, _chains);
          if (isSearching) {
            console.log("searching");
            const latitude = Number.parseFloat(urlParams.get("la") || "");
            const longitude = Number.parseFloat(urlParams.get("lo") || "");
            const searchChain = visibleChains.find(
              (c) => c.latitude === latitude && c.longitude === longitude,
            );

            if (searchChain) {
              setSidebarOpen(true);
              setFocusedChain(searchChain);
            }
          }

          setIsSearching(false);
        });

        _map.on("moveend", () => {
          getVisibleChains(_map, _chains);
        });

        _map.on("click", "chain-single", (e) => {
          if (e.features) {
            let uids = e.features
              .map((f) => f.properties?.uid)
              .filter((f) => f) as UID[];
            // filter unique
            uids = [...new Set(uids)];

            let _selectedChains = uids.map((uid) =>
              _chains.find((c) => c.uid === uid),
            ) as Chain[];

            e.clickOnLayer = true;
            setSidebarOpen(true);
            setMapClickedChains(_selectedChains);
            if (_selectedChains.length === 1) {
              handleSetFocusedChain(_selectedChains[0], true, _map);
            }
          }
        });

        _map.on("click", (e) => {
          if (!e.clickOnLayer) {
            setSidebarOpen(false);
          }

          _marker.setLngLat(e.lngLat).addTo(_map);
        });

        // zoom during click on a cluster
        _map.on("click", "chain-cluster", (e) => {
          console.log("cluster click event", e);
          const features = _map.queryRenderedFeatures(e.point, {
            layers: ["chain-cluster"],
          });
          console.log("features", features);
          const clusterId = features[0].properties?.cluster_id;

          try {
            if (!clusterId) throw "no cluster id";
            (
              _map.getSource("chains") as mapboxgl.GeoJSONSource
            ).getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              _map.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom * 1.2,
              });
            });
          } catch (err) {
            try {
              if (!features[0].properties?.uid) throw "no chain uid found";
              const chain = _chains.find(
                (c) => c.uid === features[0].properties!.uid,
              );
              if (!chain) throw "no chain found";
              _map.easeTo({
                center: [chain.longitude, chain.latitude],
                zoom: 11,
              });

              // auto select
              setMapClickedChains([chain]);
              setSidebarOpen(true);

              const uniqueFeatures = [...new Set(features.map((f) => f.id))];
              if (uniqueFeatures.length === 1) {
                handleSetFocusedChain(chain, true, _map);
              }
            } catch (err) {
              console.warn(err);
              _map.easeTo({
                center: e.lngLat,
                zoom: 11,
              });
            }
          }
        });
      });
      $chains.set(_chains);
    });

    setMap(_map);
    setMarker(_marker);

    return () => {
      _map.remove();
      setMap(undefined);
    };
  }, []);

  function handleSetFocusedChain(
    _focusedChain: Chain | null,
    shouldMove = false,
    _map?: mapboxgl.Map,
  ) {
    _map = _map || map;

    setFocusedChain(_focusedChain);
    if (!_focusedChain) return;

    let features = _map!.queryRenderedFeatures(undefined, {
      layers: ["chain-cluster", "chain-single"],
    }) as MapboxGeoJSONFeature[];

    // set the Feature
    features.forEach((f) => {
      _map!.setFeatureState(
        {
          source: "chains",
          id: f.id,
        },
        {
          clicked: f.properties!.uid === _focusedChain.uid,
        },
      );
    });

    if (shouldMove)
      _map!.easeTo({
        duration: 700,
        animate: true,
        essential: true,
        center: [_focusedChain.longitude, _focusedChain.latitude],
      });
  }

  function getVisibleChains(map: mapboxgl.Map, chains: Chain[]): Chain[] {
    const center = map.getCenter();
    const features = map!.queryRenderedFeatures(undefined, {
      layers: ["chain-cluster", "chain-single"],
    }) as any as GeoJSONChains["features"];
    let visibleFeatures: GeoJSONChains["features"] = [];
    if (features.length) {
      // Get UID of each chain in view
      for (let i = 0; i < features.length; i++) {
        let f = features[i];
        if (!f.properties?.cluster) {
          if (f.geometry.type !== "Point") continue;
          let fLngLat = new window.mapboxgl.LngLat(
            f.geometry.coordinates[GEOJSON_LONGITUDE_INDEX],
            f.geometry.coordinates[GEOJSON_LATITUDE_INDEX],
          );
          if (center.distanceTo(fLngLat) > 8000) continue;
          visibleFeatures.push(f as any);
        }
      }
    }
    const filterFunc = createFilterFunc(
      urlParams.getAll("g"),
      urlParams.getAll("s"),
    );
    let ans = visibleFeatures
      .sort((a, b) => {
        let aLngLat = new window.mapboxgl.LngLat(
          a.geometry.coordinates[GEOJSON_LONGITUDE_INDEX],
          a.geometry.coordinates[GEOJSON_LATITUDE_INDEX],
        );
        let bLngLat = new window.mapboxgl.LngLat(
          b.geometry.coordinates[GEOJSON_LONGITUDE_INDEX],
          b.geometry.coordinates[GEOJSON_LATITUDE_INDEX],
        );
        return aLngLat.distanceTo(bLngLat);
      })
      .map((f) => f.properties.chainIndex)
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .map((chainIndex) => chains[chainIndex])
      .filter(filterFunc) as Chain[];

    setVisibleChains(ans);
    return ans;
  }

  // https://docs.mapbox.com/mapbox-gl-js/style-spec/other/#set-membership-filters
  function handleSearch(
    search: SearchValues,
    longLat: GeoJSON.Position | undefined,
  ) {
    if (!chains || !map) return;

    // filter map by gender or sizes
    (map.getSource("chains") as mapboxgl.GeoJSONSource).setData(
      mapToGeoJSONChains(
        chains,
        createFilterFunc(search.genders, search.sizes),
      ),
    );

    // search
    if (longLat) {
      map.setCenter(longLat as mapboxgl.LngLatLike);
      map.setZoom(10);
      marker?.setLngLat(longLat as mapboxgl.LngLatLike).addTo(map);
      if (search.searchTerm.startsWith("Loop: ")) {
        const name = search.searchTerm.slice(6);
        const foundChains = chains.filter(
          (c) =>
            c.latitude === longLat[1] &&
            c.longitude === longLat[0] &&
            c.name === name,
        );
        if (foundChains.length) {
          setMapClickedChains(foundChains);
          if (foundChains.length === 1) setFocusedChain(foundChains[0]);
          else setFocusedChain(null);
        }
        setSidebarOpen(true);
      }
    }

    const urlSearch = toUrlSearchParams(search, longLat);
    console.log(urlSearch);
    window.history.replaceState(null, "", window.location.pathname + urlSearch);

    setMapClickedChains([]);
  }

  function handleLocation() {
    setLocationLoading(true);
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        map?.setZoom(10);
        map?.setCenter([pos.coords.longitude, pos.coords.latitude]);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        console.error("Couldn't receive location:", err.message);
      },
    );
  }

  if (!MAPBOX_TOKEN) {
    addToastError("Access tokens not configured", 500);
    return <div></div>;
  }

  return (
    <>
      <main>
        <SearchBar
          initialValues={{
            searchTerm: urlParams.get("q") || "",
            sizes: urlParams.getAll("s") || [],
            genders: urlParams.getAll("g") || [],
          }}
          onSearch={handleSearch}
        />

        <div className="relative h-[80vh]">
          <div ref={mapRef} className="h-full"></div>

          <div className="flex flex-col absolute z-30 bottom-[5%] right-2.5 rtl:right-auto rtl:left-2.5">
            <button
              className="btn btn-circle btn-outline glass bg-white/70 hover:bg-white/90 mb-4"
              onClick={() => handleLocation()}
            >
              <span
                className={`text-base-content text-lg ${
                  locationLoading
                    ? "icon-loader animate-spin"
                    : "icon-navigation"
                }`}
              />
            </button>
            <div className="btn-group btn-group-vertical">
              <button
                className={`btn rounded-t-full p-0 w-12 h-12 ${
                  zoom >= MAX_ZOOM
                    ? "btn-disabled bg-white/30"
                    : "glass bg-white/60 hover:bg-white/90 btn-outline"
                }`}
                onClick={() => mapZoom(map, "+")}
              >
                <span className="icon-plus text-base-content text-lg" />
              </button>
              <button
                className={`btn rounded-b-full p-0 w-12 h-12 ${
                  zoom <= MIN_ZOOM
                    ? "btn-disabled bg-white/30"
                    : "glass bg-white/60 hover:bg-white/90 btn-outline"
                }`}
                onClick={() => mapZoom(map, "-")}
              >
                <span className="icon-minus text-base-content text-lg" />
              </button>
            </div>
          </div>
          <Sidebar
            mapClickedChains={mapClickedChains}
            visibleChains={visibleChains}
            focusedChain={focusedChain}
            setFocusedChain={handleSetFocusedChain}
            open={sidebarOpen}
            setOpen={setSidebarOpen}
          />
        </div>
      </main>
    </>
  );
}
