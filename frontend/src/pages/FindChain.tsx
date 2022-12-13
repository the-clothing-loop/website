import { useEffect, useState, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import ReactMapGL, {
  Source,
  Layer,
  Popup,
  MapEvent,
  MapRef,
} from "react-map-gl";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import * as GeoJSONTypes from "geojson";

// Project resources
import { ChainsContext } from "../providers/ChainsProvider";
import { AuthContext } from "../providers/AuthProvider";
import { IViewPort } from "../types";
import FindChainSearchBar from "../components/FindChain/index";
import { Chain } from "../api/types";
import { chainAddUser } from "../api/chain";
import { GenderBadges, SizeBadges } from "../components/Badges";

export type ChainPredicate = (chain: Chain) => boolean;

export const defaultTruePredicate = () => true;

const accessToken = {
  mapboxApiAccessToken: import.meta.env.VITE_MAPBOX_KEY,
};
const maxZoom = 13;
const minZoom = 1;

enum ZoomOperation {
  PLUS,
  MINUS,
}

const FindChain = ({ location }: { location: Location }) => {
  const urlParams = new URLSearchParams(location.search);

  const history = useHistory();
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);

  const chains = useContext(ChainsContext);
  const publishedChains = chains.filter(({ published }) => published);

  const [viewport, setViewport] = useState<IViewPort>({
    latitude: 26.3351,
    longitude: 17.2283,
    width: "100vw",
    height: "80vh",
    zoom: 1.45,
  });
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showDutchLoopsDialog, setShowDutchLoopsDialog] = useState(false);
  const [netherlandsPopup, setNetherlandsPopup] = useState(false);

  const [filterChainPredicate, setFilterChainPredicate] =
    useState<ChainPredicate>(() => defaultTruePredicate);

  const filteredChains = publishedChains.filter(filterChainPredicate);

  const handleFindChainCallback = (findChainPredicate: ChainPredicate) => {
    const matchingChain = filteredChains.find(findChainPredicate);

    matchingChain &&
      setViewport({
        latitude: matchingChain?.latitude,
        longitude: matchingChain?.longitude,
        width: "100vw",
        height: "80vh",
        zoom: 12,
      });

    return !!matchingChain;
  };

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((location) => {
      const { longitude, latitude } = location.coords;
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken.mapboxApiAccessToken}&types=country`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features[0].properties.short_code === "nl") {
            setShowDutchLoopsDialog(true);
          }
        });
    });
  }, []);

  if (!accessToken.mapboxApiAccessToken) {
    return <div>Access tokens not configured</div>;
  }

  const signupToChain = async (e: any) => {
    e.preventDefault();
    if (authUser && selectedChain) {
      await chainAddUser(selectedChain.uid, authUser.uid, false);
      history.push({ pathname: "/thankyou" });
    } else {
      history.push({
        pathname: `/loops/${selectedChain?.uid}/users/signup`,
        state: {
          chainId: selectedChain?.uid,
        },
      });
    }
  };

  const viewChain = (e: any) => {
    e.preventDefault();
    history.push(`/loops/${selectedChain?.uid}/members`);
  };

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewport({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          width: "100vw",
          height: "75vh",
          zoom: 10,
        });
      },
      (err) => {
        console.error(`Couldn't receive location: ${err.message}`);
      }
    );
  };

  function mapZoom(viewport: IViewPort, o: ZoomOperation) {
    switch (o) {
      case ZoomOperation.PLUS:
        if (viewport.zoom < maxZoom) {
          setViewport({ ...viewport, zoom: viewport.zoom + 1 });
        }
        break;
      case ZoomOperation.MINUS:
        if (viewport.zoom > minZoom) {
          setViewport({ ...viewport, zoom: viewport.zoom - 1 });
        }
        break;
    }
  }

  interface FeatureProperties {
    radius: number;
    chainIndex: number;
    gender: string;
  }

  interface Feature<FP> extends GeoJSONTypes.Feature<GeoJSONTypes.Point, FP> {
    layer: { id: string };
  }

  const handleMapClick = (event: MapEvent) => {
    const mapFeatures = (event.features || []) as Feature<any>[];
    console.log("mapFeatures", mapFeatures);
    const topMostFeature = mapFeatures[0];

    const layerId = topMostFeature.layer.id;

    if (layerId === "chains") {
      const selectedChainIndex = topMostFeature.properties.chainIndex;

      setSelectedChain(filteredChains[selectedChainIndex]);
      setShowPopup(true);
    } else if (layerId === "cluster" || layerId === "cluster-count") {
      const clusterId = topMostFeature.properties.cluster_id;

      const mapboxSource = mapRef!.current!.getMap().getSource("chains");

      mapboxSource.getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: number) => {
          if (err) {
            return;
          }

          setViewport({
            ...viewport,
            longitude: topMostFeature.geometry.coordinates[0],
            latitude: topMostFeature.geometry.coordinates[1],
            zoom,
            transitionDuration: 500,
          });
        }
      );
    }
  };

  const geoJSONFilteredChains: GeoJSONTypes.FeatureCollection<
    GeoJSONTypes.Geometry,
    FeatureProperties
  > = {
    type: "FeatureCollection",
    features: filteredChains.map((filteredChain, filteredChainIndex) => {
      let filterGender =
        filteredChain.genders?.find(
          (g) => g === "1" || g === "2" || g === "3"
        ) || "0";

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [filteredChain.longitude, filteredChain.latitude],
        },
        properties: {
          radius: filteredChain.radius * 6,
          chainIndex: filteredChainIndex,
          gender: filterGender, // GeoJSON doesn't support nested array, see https://github.com/mapbox/mapbox-gl-js/issues/2434
        },
      };
    }),
  };

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Find Loop</title>
        <meta name="description" content="Find Loop" />
      </Helmet>

      <FindChainSearchBar
        setFilterChainPredicate={setFilterChainPredicate}
        handleFindChainCallback={handleFindChainCallback}
        initialValues={{
          searchTerm: urlParams.get("searchTerm") || "",
          sizes: urlParams.getAll("sizes") || [],
          genders: urlParams.getAll("genders") || [],
        }}
      />

      <ReactMapGL
        className={"main-map"}
        mapboxApiAccessToken={accessToken.mapboxApiAccessToken}
        mapStyle="mapbox://styles/mapbox/light-v10"
        {...viewport}
        onViewportChange={(newView: IViewPort) => setViewport(newView)}
        onClick={handleMapClick}
        ref={mapRef}
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
              "circle-color": [
                "match",
                ["get", "gender"],
                "women",
                "pink",
                "men",
                "#9a8cb4",
                "children",
                "#86CBAC",
                "#EF953D",
              ],
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
            closeButton={false}
            onClose={() => setShowPopup(false)}
          >
            <div className="p-4 w-72">
              <div className="mb-2">
                <button
                  type="button"
                  className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost feather feather-x"
                  onClick={() => setShowPopup(false)}
                ></button>
                <h1 className="font-semibold text-secondary mb-3 pr-10">
                  {selectedChain.name}
                </h1>
                <p className="mb-3">{selectedChain.description}</p>
                <div className="flex flex-col w-full text-sm">
                  <h2 className="mb-1">{t("categories")}:</h2>
                  <div className="mb-2">
                    {selectedChain.genders
                      ? GenderBadges(t, selectedChain.genders)
                      : "-"}
                  </div>
                  <h2 className="mb-1">{t("sizes")}:</h2>
                  <div className="mb-2">
                    {selectedChain.sizes
                      ? SizeBadges(t, selectedChain.sizes)
                      : "-"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start">
                {authUser?.is_root_admin && (
                  <button
                    key={"btn-view"}
                    className="btn btn-sm btn-secondary btn-outline mb-3"
                    onClick={(e) => viewChain(e)}
                  >
                    {t("viewChain")}
                    <span className="feather feather-shield ml-3"></span>
                  </button>
                )}
                <button
                  key={"btn-join"}
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={(e) => signupToChain(e)}
                >
                  {t("join")}
                  <span className="feather feather-arrow-right ml-3"></span>
                </button>
              </div>
            </div>
          </Popup>
        ) : null}
      </ReactMapGL>

      <div className="flex flex-col absolute bottom-[5%] right-2.5">
        <button
          className="btn btn-circle btn-outline glass bg-white/70 hover:bg-white/90 mb-4"
          onClick={() => handleLocation()}
        >
          <span className="feather feather-crosshair text-base-content" />
        </button>
        <div className="btn-group btn-group-vertical">
          <button
            className={`btn rounded-t-full ${
              viewport.zoom >= 12
                ? "btn-disabled bg-white/30"
                : "glass bg-white/60 hover:bg-white/90"
            }`}
            onClick={() => mapZoom(viewport, ZoomOperation.PLUS)}
          >
            <span className="feather feather-plus text-base-content" />
          </button>
          <button
            className={`btn rounded-b-full -mt-px ${
              viewport.zoom <= 1
                ? "btn-disabled bg-white/30"
                : "glass bg-white/60 hover:bg-white/90"
            }`}
            onClick={() => mapZoom(viewport, ZoomOperation.MINUS)}
          >
            <span className="feather feather-minus text-base-content" />
          </button>
        </div>
      </div>
    </>
  );
};

export default FindChain;
