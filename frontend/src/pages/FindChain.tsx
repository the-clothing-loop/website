import { useEffect, useState, useContext, useRef, MouseEvent } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import type * as GeoJSONTypes from "geojson";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";

// Project resources
import { AuthContext } from "../providers/AuthProvider";
import { Chain, UID } from "../api/types";
import { chainAddUser, chainGetAll } from "../api/chain";
import { ToastContext } from "../providers/ToastProvider";
import SearchBar, {
  SearchValues,
  toUrlSearchParams,
} from "../components/FindChain/SearchBar";
import { SizeBadges } from "../components/Badges";
import { circleRadiusKm } from "../util/maps";
import { GinParseErrors } from "../util/gin-errors";
import { features } from "process";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;

export type ChainPredicate = (chain: Chain) => boolean;

type GeoJSONChains = GeoJSONTypes.FeatureCollection<
  GeoJSONTypes.Geometry,
  {
    uid: UID;
    chainIndex: number;
    radius: number;
    gender: string;
    size: string;
  }
>;

const maxZoom = 13;
const minZoom = 3;

function mapToGeoJSONChains(
  chains: Chain[],
  filterFunc: (c: Chain) => boolean = () => true
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
        },
      };
    }),
  };
}

function createFilterFunc(
  genders: string[],
  sizes: string[]
): (c: Chain) => boolean {
  let filterFunc = (c: Chain) => true;
  if (sizes?.length) {
    filterFunc = (c) => {
      for (let s of sizes) {
        if (c.sizes?.includes(s)) return true;
      }
      if (c.uid === "f3dc978d-8bf3-4c75-835a-1e24324f2be2") {
        console.log("not found", c.sizes, sizes);
      }
      return false;
    };
  } else if (genders?.length) {
    filterFunc = (c) => {
      for (let g of genders) {
        if (c.genders?.includes(g)) return true;
      }
      return false;
    };
  }
  return filterFunc;
}

export default function FindChain({ location }: { location: Location }) {
  const history = useHistory();
  const urlParams = new URLSearchParams(location.search);

  const { t } = useTranslation();
  const { authUser, authUserRefresh } = useContext(AuthContext);
  const { addToastError, addModal } = useContext(ToastContext);

  const [chains, setChains] = useState<Chain[]>();
  const [map, setMap] = useState<mapboxgl.Map>();
  const [zoom, setZoom] = useState(4);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);
  const [chainsInView, setChainsInView] = useState<Chain[]>([]);

  const mapRef = useRef<any>();

  useEffect(() => {
    const _center = [
      Number.parseFloat(urlParams.get("lo") || ""),
      Number.parseFloat(urlParams.get("la") || ""),
    ];
    const hasCenter = !!(_center[0] && _center[1]);
    const _map = new mapboxgl.Map({
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

    setZoom(4);

    const clusterMaxZoom = 8;
    chainGetAll({ filter_out_unpublished: true }).then((res) => {
      const _chains = res.data;

      _map.on("zoomend", (e) => {
        setZoom(e.target.getZoom());
      });

      const filterFunc = createFilterFunc(
        urlParams.getAll("g"),
        urlParams.getAll("s")
      );

      _map.on("load", () => {
        _map.addSource("chains", {
          type: "geojson",
          data: mapToGeoJSONChains(_chains, filterFunc),
          cluster: true,
          clusterMaxZoom: clusterMaxZoom,
          clusterMinPoints: 1,
          clusterRadius: 25,
        });

        _map.addLayer({
          id: "chain-cluster",
          type: "circle",
          source: "chains",
          filter: ["<=", ["zoom"], clusterMaxZoom],
          paint: {
            "circle-color": ["rgba", 239, 149, 61, 0.6], // #ef953d
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
            "circle-color": ["rgba", 240, 196, 73, 0.4], // #f0c449
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
            "circle-stroke-color": ["rgba", 240, 196, 73, 1],
          },
        });
        _map.addLayer({
          id: "chain-single-minimum",
          type: "circle",
          source: "chains",
          filter: [">", ["zoom"], clusterMaxZoom],
          paint: {
            "circle-color": ["rgba", 240, 196, 73, 0.0], // #f0c449
            "circle-radius": 5,
            "circle-stroke-width": 0,
          },
        });

        // Initalize chainsInView
        setTimeout(() => getChainsInView(_map, _chains), 500);

        _map.on("moveend", () => {
          getChainsInView(_map, _chains);
        });

        _map.on("click", ["chain-single", "chain-single-minimum"], (e) => {
         // console.log("where r u");
          if (e.features) {
            let uids = e.features
              .map((f) => f.properties?.uid)
              .filter((f) => f) as UID[];
            // filter unique
            uids = [...new Set(uids)];

            let _selectedChains = uids.map((uid) =>
              _chains.find((c) => c.uid === uid)
            ) as Chain[];
            if (_selectedChains.length) {
              _selectedChains.forEach((c) => console.info(c.name, c.uid));
              setSelectedChains(_selectedChains);
            }
          }
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
                zoom,
              });
            });
          } catch (err) {
            try {
              if (!features[0].properties?.uid) throw "no chain uid found";
              const chain = _chains.find(
                (c) => c.uid === features[0].properties!.uid
              );
              if (!chain) throw "no chain found";
              _map.easeTo({
                center: [chain.longitude, chain.latitude],
                zoom: 11,
              });

              // auto select
              setSelectedChains([chain]);
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
      setChains(_chains);
    });

    setMap(_map);

    return () => {
      _map.remove();
      setMap(undefined);
    };
  }, []);

  function getChainsInView(map: mapboxgl.Map, chains: Chain[]) {
    const features = map!.queryRenderedFeatures(undefined, {
      layers: ["chain-cluster", "chain-single", "chain-single-minimum"],
    });
    if (features.length) {
      console.log(features);
      var uidsArray: string[] = [];

      // Get UID of each chain in view
      features.forEach((f) => {
        var clusterID = f.properties!.cluster_id;
        var pointCount = f.properties!.point_count;
        var clusterSource = map!.getSource("chains") as GeoJSONSource;

        if (f.properties!.cluster) {
          // Gets all leaves of cluster
          clusterSource.getClusterLeaves(
            clusterID,
            pointCount,
            0,
            function (err, aFeatures) {
              if (err) {
                console.log("getClusterLeaves", err, aFeatures);
              } else {
                let uids = aFeatures
                  .map((f) => f.properties?.uid)
                  .filter((f) => f) as UID[];
                uids = [...new Set(uids)];

                uidsArray = [...uidsArray, ...uids];
                uidsArray = [...new Set(uidsArray)];

                let _chainsInView = uidsArray.map((uidsArray) =>
                  chains.find((c) => c.uid === uidsArray)
                ) as Chain[];

                if (_chainsInView.length) {
                  setChainsInView(_chainsInView);
                }
              }
            }
          );
          // When the feature is not a cluster
        } else {
          const curr = f.properties!.uid;
          uidsArray = [...uidsArray, curr];
          uidsArray = [...new Set(uidsArray)];

          let _chainsInView = uidsArray.map((uidsArray) =>
            chains.find((c) => c.uid === uidsArray)
          ) as Chain[];

          if (_chainsInView.length) {
            setChainsInView(_chainsInView);
          }
        }
      });
    }
  }

  // https://docs.mapbox.com/mapbox-gl-js/style-spec/other/#set-membership-filters
  function handleSearch(
    search: SearchValues,
    longLat: GeoJSON.Position | undefined
  ) {
    if (!chains || !map) return;

    // filter map by gender or sizes
    (map.getSource("chains") as mapboxgl.GeoJSONSource).setData(
      mapToGeoJSONChains(chains, createFilterFunc(search.genders, search.sizes))
    );

    // search
    if (longLat) {
      map.setCenter(longLat as mapboxgl.LngLatLike);
      map.setZoom(10);
    }

    window.history.replaceState(
      {},
      "",
      window.location.origin +
        window.location.pathname +
        toUrlSearchParams(search, longLat)
    );

    setSelectedChains([]);
  }

  function handleClickJoin(e: MouseEvent<HTMLButtonElement>, chain: Chain) {
    e.preventDefault();
    if (authUser && chain.uid) {
      addModal({
        message: t("AreYouSureJoinLoop", {
          chainName: chain.name,
        }),
        actions: [
          {
            text: t("join"),
            type: "secondary",
            fn: () => {
              chainAddUser(chain.uid, authUser.uid, false)
                .then(() => {
                  authUserRefresh();
                  history.push({ pathname: "/thankyou" });
                })
                .catch((err) => {
                  addToastError(GinParseErrors(t, err), err?.status);
                });
            },
          },
        ],
      });
    } else {
      history.push({
        pathname: `/loops/${chain.uid}/users/signup`,
        state: {
          chainId: chain.uid,
        },
      });
    }
  }

  function handleClickViewChain(
    e: MouseEvent<HTMLButtonElement>,
    chainUID: UID
  ) {
    e.preventDefault();
    history.push(`/loops/${chainUID}/members`);
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
      }
    );
  }

  function mapZoom(o: "+" | "-") {
    let z = map?.getZoom() || 4;
    switch (o) {
      case "+":
        if (z < maxZoom) {
          console.log("z", z + 1);
          map?.setZoom(z + 1);
        }
        break;
      case "-":
        if (z > minZoom) {
          console.log("z", z - 1);
          map?.setZoom(z - 1);
        }
        break;
    }
  }

  function getDistanceFromCenter(chain: Chain) {
    const center = map!.getCenter();

    // Convert to raidans
    var lat = chain.latitude / (180 / Math.PI);
    var long = chain.longitude / (180 / Math.PI);
    var centerLat = center.lat / (180 / Math.PI);
    var centerLong = center.lng / (180 / Math.PI);

    var distance =
      Math.acos(
        Math.sin(lat) * Math.sin(centerLat) +
          Math.cos(lat) * (Math.cos(centerLat) * Math.cos(centerLong - long))
      ) * 6371;
    return distance;
  }

  if (!MAPBOX_TOKEN) {
    addToastError("Access tokens not configured", 500);
    return <div></div>;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Find Loop</title>
        <meta name="description" content="Find Loop" />
      </Helmet>

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
                className={`feather text-base-content text-lg ${
                  locationLoading
                    ? "feather-loader animate-spin"
                    : "feather-navigation"
                }`}
              />
            </button>
            <div className="btn-group btn-group-vertical">
              <button
                className={`btn rounded-t-full p-0 w-12 h-12 ${
                  zoom >= maxZoom
                    ? "btn-disabled bg-white/30"
                    : "glass bg-white/60 hover:bg-white/90 btn-outline"
                }`}
                onClick={() => mapZoom("+")}
              >
                <span className="feather feather-plus text-base-content text-lg" />
              </button>
              <button
                className={`btn rounded-b-full p-0 w-12 h-12 ${
                  zoom <= minZoom
                    ? "btn-disabled bg-white/30"
                    : "glass bg-white/60 hover:bg-white/90 btn-outline"
                }`}
                onClick={() => mapZoom("-")}
              >
                <span className="feather feather-minus text-base-content text-lg" />
              </button>
            </div>
          </div>
          <div
            className={`absolute z-30 top-4 left-4 rtl:left-auto rtl:right-4 max-h-full w-72 overflow-y-auto overflow-x-visible ${
              chainsInView.length ? "" : "hidden"
            }`}
          >
            {chainsInView
              .sort((a, b) => {
                return Math.min(
                  getDistanceFromCenter(a),
                  getDistanceFromCenter(b)
                );
              })
              .map((chain) => {
                const userChain = authUser?.chains.find(
                  (uc) => uc.chain_uid === chain.uid
                );

                const selected = selectedChains.find(
                  (u) => chain.uid === u.uid
                );

                return (
                  <div
                    className={`p-4 w-full mb-4 rounded-lg shadow-md bg-base-100 
                   //   selected ? "animate-[200ms_linear_0ms_max-h]" : "animate-[200ms_linear_0ms_max-h]"
                    `}
                    key={chain.uid}
                  >
                    <div className="mb-2">
                      <h1 className="font-semibold text-secondary mb-3 pr-10 rtl:pr-0 rtl:pl-10 break-words">
                        {chain.name}
                      </h1>

                      {selected && chain.description ? (
                        chain.description.length > 200 ? (
                          <div className="mb-3">
                            <input
                              type="checkbox"
                              className="hidden peer"
                              id={"checkbox-desc-more-" + chain.uid}
                            />
                            <p
                              className="overflow-hidden peer-checked:max-h-fit text-sm break-words max-h-12 relative before:block before:absolute before:h-8 before:w-full before:bg-gradient-to-t before:from-white/90 before:to-transparent before:bottom-0 peer-checked:before:hidden"
                              tabIndex={0}
                              onClick={(e) => {
                                let input = (
                                  e.target as HTMLParagraphElement
                                ).parentElement?.querySelector("input");
                                console.log("input", input);

                                if (input) input.checked = true;
                              }}
                            >
                              {chain.description.split("\n").map((s, i) => {
                                if (i === 0) return s;

                                return (
                                  <>
                                    <br />
                                    {s}
                                  </>
                                );
                              })}
                            </p>
                            <label
                              htmlFor={"checkbox-desc-more-" + chain.uid}
                              aria-label="expand"
                              className="btn btn-xs btn-ghost bg-teal-light feather feather-more-horizontal"
                            ></label>
                          </div>
                        ) : (
                          <p className="mb-3 text-sm break-words">
                            {chain.description}
                          </p>
                        )
                      ) : null}

                      {selected ? (
                        <div>
                          <div className="flex flex-col w-full text-sm">
                            {chain.sizes?.length ? (
                              <>
                                <h2 className="mb-1">{t("sizes")}:</h2>
                                <div className="mb-2">
                                  <SizeBadges
                                    s={chain.sizes}
                                    g={chain.genders}
                                  />
                                </div>
                              </>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-start">
                            {authUser?.is_root_admin ||
                            userChain?.is_chain_admin ? (
                              <button
                                key={"btn-view"}
                                className="btn btn-sm btn-secondary btn-outline mb-3"
                                onClick={(e) =>
                                  handleClickViewChain(e, chain.uid)
                                }
                              >
                                {t("viewLoop")}
                                <span className="feather feather-shield ml-3"></span>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {userChain ? (
                        userChain.is_approved ? (
                          <p className="bg-primary px-3 font-semibold text-sm border border-primary h-8 flex items-center">
                            {t("joined")}
                            <span className="feather feather-check ml-3"></span>
                          </p>
                        ) : (
                          <p className="px-3 font-semibold text-sm border border-secondary h-8 flex items-center text-secondary">
                            {t("pendingApproval")}
                            <span className="feather feather-user-check ml-3"></span>
                          </p>
                        )
                      ) : chain.open_to_new_members ? (
                        <button
                          onClick={(e) => handleClickJoin(e, chain)}
                          type="button"
                          className="btn btn-sm btn-primary"
                        >
                          {t("join")}
                          <span className="feather feather-arrow-right ml-3 rtl:hidden"></span>
                          <span className="feather feather-arrow-left mr-3 ltr:hidden"></span>
                        </button>
                      ) : (
                        <p className="px-3 font-semibold text-sm border border-secondary h-8 flex items-center text-secondary">
                          {t("closed")}
                          <span className="feather feather-lock ml-3 rtl:ml-0 rtl:mr-3"></span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          <div
            className={`absolute z-30 top-4 left-4 rtl:left-auto rtl:right-4 max-h-full w-72 overflow-y-auto overflow-x-visible ${
              selectedChains.length ? "" : "hidden"
            }`}
          >
            <button
              key="close"
              type="button"
              onClick={() => setSelectedChains([])}
              className="absolute top-2 right-2 rtl:right-auto rtl:left-2 btn btn-sm btn-circle btn-outline"
            >
              <span className="feather feather-arrow-left rtl:hidden"></span>
              <span className="feather feather-arrow-right ltr:hidden"></span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
