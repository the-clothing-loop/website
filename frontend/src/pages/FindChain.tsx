import { useEffect, useState, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import * as GeoJSONTypes from "geojson";

import mapboxgl from "mapbox-gl";

// Project resources
// import { ChainsContext } from "../providers/ChainsProvider";
import { AuthContext } from "../providers/AuthProvider";
import { IViewPort } from "../types";
import FindChainSearchBarContainer, {
  SearchValues,
} from "../components/FindChain/FindChainSearchBarContainer";
import { Chain, UID } from "../api/types";
// import { GenderI18nKeys, Genders, SizeI18nKeys } from "../api/enums";
import { chainAddUser, chainGetAll } from "../api/chain";
import { ToastContext } from "../providers/ToastProvider";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
mapboxgl.workerClass =
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

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

const binary = {};

export const defaultTruePredicate = () => true;
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY || "";
const maxZoom = 13;
const minZoom = 3;

function mapToGeoJSONChains(chains: Chain[]): GeoJSONChains {
  return {
    type: "FeatureCollection",
    features: chains.map((chain, chainIndex) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [chain.longitude, chain.latitude],
        },
        properties: {
          uid: chain.uid,
          chainIndex: chainIndex,
          radius: chain.radius * 6,
          gender: chain.genders?.join("") || "",
          size: chain.sizes?.join("") || "",
        },
      };
    }),
  };
}

export default function FindChain({ location }: { location: Location }) {
  const urlParams = new URLSearchParams(location.search);

  const history = useHistory();
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const { addToastError } = useContext(ToastContext);

  const [map, setMap] = useState<mapboxgl.Map>();
  const [zoom, setZoom] = useState(4);
  const [, _setSearchValues] = useState<SearchValues>();

  /*
  const [viewport, setViewport] = useState<IViewPort>({
    latitude: 26.3351,
    longitude: 17.2283,
    width: "100vw",
    height: "80vh",
    zoom: 1.45,
  });
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [filterChainPredicate, setFilterChainPredicate] =
    useState<ChainPredicate>(() => defaultTruePredicate);

  const filteredChains = publishedChains.filter(filterChainPredicate);

  
  */

  const mapRef = useRef<any>();

  useEffect(() => {
    const _map = new mapboxgl.Map({
      accessToken: MAPBOX_TOKEN,
      container: mapRef.current,
      zoom: 4,
      minZoom: 1,
      maxZoom: 13,
      center: [4.8998197, 52.3673008],
      style: "mapbox://styles/mapbox/light-v11",
    });

    setZoom(4);

    chainGetAll({ filter_out_unpublished: true }).then((res) => {
      const _chains = res.data;

      _map.on("zoomend", (e) => {
        setZoom(e.target.getZoom());
      });

      _map.on("load", () => {
        _map.addSource("chains", {
          type: "geojson",
          data: mapToGeoJSONChains(_chains),
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 30,
        });
        _map.addLayer({
          id: "chain-cluster",
          type: "circle",
          source: "chains",
          filter: ["==", "cluster", true],
          paint: {
            "circle-color": "#ef953d",
            "circle-radius": 20,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
        _map.addLayer({
          id: "chain-single",
          type: "circle",
          source: "chains",
          filter: ["!=", "cluster", true],
          paint: {
            "circle-color": [
              "case",
              ["in", ["get", "gender"], "2"],
              "#dc77a3",
              ["in", ["get", "gender"], "3"],
              "#1467b3",
              ["in", ["get", "gender"], "1"],
              "#f0c449",
              "#000",
            ],
            "circle-radius": ["get", "radius"],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      });
    });

    setMap(_map);

    return () => {
      _map.remove();
      setMap(undefined);
    };
  }, []);

  // https://docs.mapbox.com/mapbox-gl-js/style-spec/other/#set-membership-filters
  function setSearchValues(sv: SearchValues) {
    let filterOptions: any[] = [true];
    if (sv.sizes.length) {
      filterOptions = ["in", "size", ...sv.sizes];
    } else if (sv.genders.length) {
      filterOptions = ["in", "gender", ...sv.genders];
    }
    // map?.setFilter("chains", filterOptions);

    _setSearchValues(sv);
  }

  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition((location) => {
  //     const { longitude, latitude } = location.coords;
  //     // get chains inside a long/lat square for better performance
  //   });
  // }, []);

  if (!MAPBOX_TOKEN) {
    addToastError("Access tokens not configured");
    return <div></div>;
  }

  // const signupToChain = async (e: any) => {
  //   e.preventDefault();
  //   if (authUser && selectedChain) {
  //     await chainAddUser(selectedChain.uid, authUser.uid, false);
  //     history.push({ pathname: "/thankyou" });
  //   } else {
  //     history.push({
  //       pathname: `/loops/${selectedChain?.uid}/users/signup`,
  //       state: {
  //         chainId: selectedChain?.uid,
  //       },
  //     });
  //   }
  // };

  // function handleFindChainCallback(search: string): boolean {
  //   geo;
  //   const matchingChain = filteredChains.find(findChainPredicate);

  //   matchingChain &&
  //     setViewport({
  //       latitude: matchingChain?.latitude,
  //       longitude: matchingChain?.longitude,
  //       width: "100vw",
  //       height: "80vh",
  //       zoom: 12,
  //     });

  //   return !!matchingChain;
  // }

  // const viewChain = (e: any) => {
  //   e.preventDefault();
  //   history.push(`/loops/${selectedChain?.uid}/members`);
  // };

  function handleLocation() {
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        map?.setZoom(10);
        map?.setCenter([pos.coords.longitude, pos.coords.latitude]);
      },
      (err) => {
        console.error(`Couldn't receive location: ${err.message}`);
        addToastError(`Couldn't receive location: ${err.message}`);
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

  interface Feature<FP> extends GeoJSONTypes.Feature<GeoJSONTypes.Point, FP> {
    layer: { id: string };
  }

  // const handleMapClick = (event: MapEvent) => {
  //   const mapFeatures = (event.features || []) as Feature<any>[];
  //   console.log("mapFeatures", mapFeatures);
  //   const topMostFeature = mapFeatures[0];

  //   const layerId = topMostFeature.layer.id;

  //   if (layerId === "chains") {
  //     const selectedChainIndex = topMostFeature.properties.chainIndex;

  //     setSelectedChain(filteredChains[selectedChainIndex]);
  //     setShowPopup(true);
  //   } else if (layerId === "cluster" || layerId === "cluster-count") {
  //     const clusterId = topMostFeature.properties.cluster_id;

  //     const mapboxSource = mapRef!.current!.getMap().getSource("chains");

  //     mapboxSource.getClusterExpansionZoom(
  //       clusterId,
  //       (err: any, zoom: number) => {
  //         if (err) {
  //           return;
  //         }

  //         setViewport({
  //           ...viewport,
  //           longitude: topMostFeature.geometry.coordinates[0],
  //           latitude: topMostFeature.geometry.coordinates[1],
  //           zoom,
  //           transitionDuration: 500,
  //         });
  //       }
  //     );
  //   }
  // };

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Find Loop</title>
        <meta name="description" content="Find Loop" />
      </Helmet>

      <main>
        <FindChainSearchBarContainer
          setSearchValues={() => setSearchValues}
          onSearchCallback={() => false}
          initialValues={{
            searchTerm: urlParams.get("searchTerm") || "",
            sizes: urlParams.getAll("sizes") || [],
            genders: urlParams.getAll("genders") || [],
          }}
        />

        <div className="relative h-[600px]">
          <div ref={mapRef} className="h-full"></div>

          <div className="flex flex-col absolute z-30 bottom-[5%] right-2.5">
            <button
              className="btn btn-circle btn-outline glass bg-white/70 hover:bg-white/90 mb-4"
              onClick={() => handleLocation()}
            >
              <span className="feather feather-crosshair text-base-content" />
            </button>
            <div className="btn-group btn-group-vertical">
              <button
                className={`btn rounded-t-full ${
                  zoom >= maxZoom
                    ? "btn-disabled bg-white/30"
                    : "glass bg-white/60 hover:bg-white/90"
                }`}
                onClick={() => mapZoom("+")}
              >
                <span className="feather feather-plus text-base-content" />
              </button>
              <button
                className={`btn rounded-b-full -mt-px ${
                  zoom <= minZoom
                    ? "btn-disabled bg-white/30"
                    : "glass bg-white/60 hover:bg-white/90"
                }`}
                onClick={() => mapZoom("-")}
              >
                <span className="feather feather-minus text-base-content" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
/* <ReactMapGL
  className={"main-map"}
  mapboxApiAccessToken={accessToken.mapboxApiAccessToken}
  mapStyle="mapbox://styles/mapbox/light-v10"
  {...viewport}
  onViewportChange={(newView: IViewPort) => setViewport(newView)}
  onClick={handleMapClick}
  scrollZoom
>
  <Source
    id="chains"
    type="geojson"
    data={geoJSONFilteredChains}
    cluster
    clusterMaxZoom={12}
    clusterRadius={50}
  >
    <Layer
      id="chains"
      type="circle"
      filter={["!", ["has", "point_count"]]}
      paint={{
        "circle-color": 
        "circle-radius": ["get", "radius"],
        "circle-blur": 0.8,
      }}
    />
    <Layer
      id="cluster"
      type="circle"
      filter={["has", "point_count"]}
      paint={{
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#513484",
          100,
          "#513484",
          750,
          "#513484",
        ],
        "circle-radius": 30,
        "circle-blur": 0.7,
      }}
    />
    <Layer
      id="cluster-count"
      type="symbol"
      filter={["has", "point_count"]}
      layout={{
        "text-field": "{point_count_abbreviated}",
      }}
      paint={{ "text-color": "white" }}
    />
  </Source>

  {selectedChain && showPopup ? (
    <Popup
      latitude={selectedChain.latitude}
      longitude={selectedChain.longitude}
      closeOnClick={false}
      dynamicPosition
      onClose={() => setShowPopup(false)}
    >
      <div className="card">
        <div className="card-body">
          <h1 className="mb-3">{selectedChain.name}</h1>
          <p id="description">{selectedChain.description}</p>
          <div className="flex flex-col w-full pt-8">
            <h3>{t("categories")}:</h3>
            <div id="categories-container">
              {selectedChain.genders
                ? selectedChain.genders.sort().map((gender, i) => {
                    return <p key={i}>{t(GenderI18nKeys[gender])}</p>;
                  })
                : null}
            </div>
            <h3>{t("sizes")}:</h3>
            <div id="sizes-container">
              {selectedChain.sizes
                ? selectedChain.sizes.sort().map((size, i) => {
                    return <p key={i}>{t(SizeI18nKeys[size])}</p>;
                  })
                : null}
            </div>
          </div>
        </div>

        <div className="card-action">
          <button
            key={"btn-join"}
            type="button"
            className="btn btn-primary"
            onClick={(e) => signupToChain(e)}
          >
            {t("join")}
            <span className="feather feather-arrow-right ml-4"></span>
          </button>
          {authUser?.is_root_admin && (
            <button
              key={"btn-view"}
              className="btn btn-primary"
              onClick={(e) => viewChain(e)}
            >
              {t("viewChain")}
            </button>
          )}
        </div>
      </div>
    </Popup>
  ) : null}
</ReactMapGL>


    */
