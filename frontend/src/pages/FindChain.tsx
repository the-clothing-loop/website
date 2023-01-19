import { useEffect, useState, useContext, useRef, MouseEvent } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import type * as GeoJSONTypes from "geojson";
import mapboxgl from "mapbox-gl";

// Project resources
import { AuthContext } from "../providers/AuthProvider";
import { Chain, UID } from "../api/types";
import { chainAddUser, chainGetAll } from "../api/chain";
import { ToastContext } from "../providers/ToastProvider";
import SearchBar, {
  SearchValues,
  toUrlSearchParams,
} from "../components/FindChain/SearchBar";
import { GenderBadges, SizeBadges } from "../components/Badges";
import { circleRadiusKm } from "../util/maps";
import { GinParseErrors } from "../util/gin-errors";

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
  const { addToastError } = useContext(ToastContext);

  const [chains, setChains] = useState<Chain[]>();
  const [map, setMap] = useState<mapboxgl.Map>();
  const [zoom, setZoom] = useState(4);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);

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
          clusterMaxZoom: 10,
          clusterRadius: 30,
        });
        _map.addLayer({
          id: "chain-cluster",
          type: "circle",
          source: "chains",
          filter: ["has", "point_count"],
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
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });
        _map.addLayer({
          id: "chain-single",
          type: "circle",
          source: "chains",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["rgba", 240, 196, 73, 0.8], // #f0c449
            "circle-radius": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              0,
              0,
              20,
              ["get", "radius"],
            ],
            "circle-stroke-width": 0,
            "circle-blur": 0.6,
          },
        });
        _map.addLayer({
          id: "chain-single-minimum",
          type: "circle",
          source: "chains",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["rgba", 240, 196, 73, 0.6], // #f0c449
            "circle-radius": 5,
            "circle-stroke-width": 0,
          },
        });
        _map.on("click", ["chain-single", "chain-single-minimum"], (e) => {
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
          const features = _map.queryRenderedFeatures(e.point, {
            layers: ["chain-cluster"],
          });
          const clusterId = features[0].properties?.cluster_id;
          (
            _map.getSource("chains") as mapboxgl.GeoJSONSource
          ).getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            _map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom,
            });
          });
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

  function handleClickJoin(e: MouseEvent<HTMLButtonElement>, chainUID: UID) {
    e.preventDefault();
    if (authUser && chainUID) {
      chainAddUser(chainUID, authUser.uid, false)
        .then(() => {
          authUserRefresh();
          history.push({ pathname: "/thankyou" });
        })
        .catch((err) => {
          addToastError(GinParseErrors(t, err), err?.status);
        });
    } else {
      history.push({
        pathname: `/loops/${chainUID}/users/signup`,
        state: {
          chainId: chainUID,
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
        console.error(`Couldn't receive location: ${err.message}`, 400);
      }
    );
  }

  function mapZoom(o: "+" | "-") {
    let z = map?.getZoom() || 4;
    switch (o) {
      case "+":
        if (z < maxZoom) {
          map?.setZoom(z + 1);
        }
        break;
      case "-":
        if (z > minZoom) {
          map?.setZoom(z - 1);
        }
        break;
    }
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

          <div className="flex flex-col absolute z-30 bottom-[5%] right-2.5">
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
            className={`absolute z-30 top-4 left-4 max-h-full w-72 overflow-y-auto ${
              selectedChains.length ? "" : "hidden"
            }`}
          >
            <button
              key="close"
              type="button"
              onClick={() => setSelectedChains([])}
              className="absolute top-2 right-2 btn btn-sm btn-circle btn-outline"
            >
              <span className="feather feather-arrow-left"></span>
            </button>
            {selectedChains.map((chain) => (
              <div
                className="p-4 w-full mb-4 rounded-lg bg-base-100"
                key={chain.uid}
              >
                <div className="mb-2">
                  <h1 className="font-semibold text-secondary mb-3 pr-10">
                    {chain.name}
                  </h1>
                  {chain.description ? (
                    chain.description.length > 200 ? (
                      <div className="mb-3">
                        <input
                          type="checkbox"
                          className="hidden peer"
                          id={"checkbox-desc-more-" + chain.uid}
                        />
                        <p
                          className="overflow-hidden peer-checked:max-h-fit text-sm break-words max-h-12"
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
                          className="btn btn-xs btn-secondary btn-ghost feather feather-more-horizontal"
                        ></label>
                      </div>
                    ) : (
                      <p className="mb-3 text-sm break-words">
                        {chain.description}
                      </p>
                    )
                  ) : null}
                  <div className="flex flex-col w-full text-sm">
                    {chain.genders?.length ? (
                      <>
                        <h2 className="mb-1">{t("categories")}:</h2>
                        <div className="mb-2">
                          {GenderBadges(t, chain.genders)}
                        </div>
                      </>
                    ) : null}
                    {chain.sizes?.length ? (
                      <>
                        <h2 className="mb-1">{t("sizes")}:</h2>
                        <div className="mb-2">{SizeBadges(t, chain.sizes)}</div>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  {authUser?.is_root_admin ? (
                    <button
                      key={"btn-view"}
                      className="btn btn-sm btn-secondary btn-outline mb-3"
                      onClick={(e) => handleClickViewChain(e, chain.uid)}
                    >
                      {t("viewChain")}
                      <span className="feather feather-shield ml-3"></span>
                    </button>
                  ) : null}

                  <button
                    onClick={(e) => handleClickJoin(e, chain.uid)}
                    type="button"
                    className="btn btn-sm btn-primary"
                  >
                    {t("join")}
                    <span className="feather feather-arrow-right ml-3"></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
