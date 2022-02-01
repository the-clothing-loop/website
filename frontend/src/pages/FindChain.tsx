import { useEffect, useState, useContext, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import ReactMapGL, {
  Source,
  Layer,
  Popup,
  MapEvent,
  MapRef,
  Marker,
} from "react-map-gl";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import * as GeoJSONTypes from "geojson";

import mapboxgl from "mapbox-gl";

// Material UI
import { Button } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CircleIcon from "@mui/icons-material/Circle";

// Project resources
import { ChainsContext } from "../components/ChainsProvider";
import { AuthContext } from "../components/AuthProvider";
import { addUserToChain } from "../util/firebase/chain";
import { IChain, IViewPort } from "../types";
import theme from "../util/theme";
import { getUserById } from "../util/firebase/user";
import { FindChainSearchBarContainer } from "../components/FindChain";

// Media
import RightArrow from "../images/right-arrow-white.svg";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

export interface ChainPredicate {
  (chain: IChain): boolean;
}

export const defaultTruePredicate = () => true;

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};

const FindChain = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const classes = makeStyles(theme as any)();

  const chains = useContext(ChainsContext);
  const publishedChains = chains.filter(({ published }) => published);

  const [viewport, setViewport] = useState<IViewPort | {}>({});
  const [selectedChain, setSelectedChain] = useState<IChain | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string | null>(null);
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
        height: "75vh",
        zoom: 8,
        maxZoom: 12,
      });

    return !!matchingChain;
  };

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    (async () => {
      //get user role
      if (user) {
        setUserId(user.uid);
        const userRole = await getUserById(user.uid);
        setRole(userRole.role);
      }

      setViewport({
        latitude: 0,
        longitude: 0,
        width: "100vw",
        height: "75vh",
        zoom: 1,
        maxZoom: 12,
      });
    })();
  }, []);

  if (!accessToken.mapboxApiAccessToken) {
    return <div>Access tokens not configured</div>;
  }

  const signupToChain = async (e: any) => {
    e.preventDefault();
    if (user) {
      await addUserToChain(selectedChain!.id, user.uid);
      history.push({ pathname: "/thankyou" });
    } else {
      history.push({
        pathname: `/users/signup/${selectedChain?.id}`,
        state: {
          chainId: selectedChain?.id,
        },
      });
    }
  };

  const viewChain = (e: any) => {
    e.preventDefault();
    history.push(`/loops/members/${selectedChain?.id}`);
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
          maxZoom: 12,
        });
      },
      (err) => {
        console.error(`Couldn't receive location: ${err.message}`);
      }
    );
  };

  const mapZoom = (viewport: IViewPort | {}, operation: string) => {
    if ("zoom" in viewport) {
      if (operation === "+" && viewport.zoom === 12) {
        return setViewport({ ...viewport, viewport: 12 });
      }
      operation === "+"
        ? setViewport({ ...viewport, zoom: viewport.zoom + 1 })
        : setViewport({ ...viewport, zoom: viewport.zoom - 1 });
    }
  };

  const handleMapClick = (event: MapEvent) => {
    const topMostFeature = event?.features?.[0];
    const {
      layer: { id: layerId },
    } = topMostFeature;

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

          const {
            geometry: { coordinates },
          } = topMostFeature;

          setViewport({
            ...viewport,
            longitude: coordinates[0],
            latitude: coordinates[1],
            zoom,
            transitionDuration: 500,
          });
        }
      );
    }
  };

  const geoJSONFilteredChains: GeoJSONTypes.FeatureCollection<GeoJSONTypes.Geometry> =
    {
      type: "FeatureCollection",
      features: filteredChains.map((filteredChain, filteredChainIndex) => {
        const {
          longitude,
          latitude,
          categories: { gender },
        } = filteredChain;

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          properties: {
            chainIndex: filteredChainIndex,
            gender: gender.includes("women")
              ? "woman"
              : gender.includes("men")
              ? "men"
              : "children", // GeoJSON doesn't support nested array, see https://github.com/mapbox/mapbox-gl-js/issues/2434
          },
        };
      }),
    };

  return (
    <>
      <Helmet>
        <title>Clothing-Loop | Find Loop</title>
        <meta name="description" content="Find Loop" />
      </Helmet>

      <FindChainSearchBarContainer
        setFilterChainPredicate={setFilterChainPredicate}
        handleFindChainCallback={handleFindChainCallback}
      />

      <ReactMapGL
        className={"main-map"}
        mapboxApiAccessToken={accessToken.mapboxApiAccessToken}
        mapStyle="mapbox://styles/mapbox/light-v10"
        {...viewport}
        onViewportChange={(newView: IViewPort) => setViewport(newView)}
        onClick={handleMapClick}
        ref={mapRef}
        scrollZoom={false}
      >
        <Source
          id="chains"
          type="geojson"
          data={geoJSONFilteredChains}
          cluster={true}
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
                "#F7C86F",
                "#48808B",
              ],
              "circle-radius": 30,
              "circle-blur": 0.7,
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
                "#518D7E",
                100,
                "#f1f075",
                750,
                "#f28cb1",
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

        {/* ====start TO REMOVE ONCE ALL DUTCH LOOPS ARE MIGRATED INTO FIREBASE */}
        <Marker
          key={"marker-netherlands"}
          longitude={4.9041}
          latitude={52.3676}
        >
          <button
            onClick={() => {
              setNetherlandsPopup(true);
            }}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#98D9DE",
              borderRadius: "50%",
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: "#98D9DE",
              boxShadow: " 0px 0px 15px #98D9DE",
              position: "absolute",
            }}
          >
            <p
              style={{
                color: "white",
                margin: "0",
              }}
            >
              315
            </p>
          </button>
        </Marker>
        {netherlandsPopup ? (
          <Popup
            longitude={4.9041}
            latitude={52.3676}
            closeOnClick={true}
            dynamicPosition={true}
            onClose={() => setNetherlandsPopup(false)}
          >
            <Card className={classes.card} style={{ maxWidth: "500px" }}>
              <CardContent className={classes.cardContent}>
                <Typography component="h1" gutterBottom>
                  {"The Netherlands"}
                </Typography>
                <Typography component="p" id="description">
                  {
                    "We are in the process of migrating all Dutch loops into this platform. If you are in the Netherlands and want to join, please signup following the link below.  "
                  }
                </Typography>

                <CardActions className={classes.cardsAction}>
                  <Link
                    to={{
                      pathname:
                        "https://docs.google.com/forms/d/e/1FAIpQLSfeyclg6SjM3GRBbaBprFZhoha3Q9a7l3xs1s9eIDpKeVzi6w/viewform",
                    }}
                    target="_blank"
                    key={"btn-join"}
                    className={classes.button}
                  >
                    {t("join")}
                    <img src={RightArrow} alt="" />
                  </Link>
                </CardActions>
              </CardContent>
            </Card>
          </Popup>
        ) : null}
        {/* ===end  TO REMOVE ONCE ALL DUTCH LOOPS ARE MIGRATED INTO FIREBASE */}

        {selectedChain && showPopup ? (
          <Popup
            latitude={selectedChain.latitude}
            longitude={selectedChain.longitude}
            closeOnClick={false}
            dynamicPosition={true}
            onClose={() => setShowPopup(false)}
          >
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography component="h1" gutterBottom>
                  {selectedChain.name}
                </Typography>
                <Typography component="p" id="description">
                  {selectedChain.description}
                </Typography>
                <div className={"chain-categories"}>
                  <Typography component="h3">{t("categories")}:</Typography>
                  <div id="categories-container">
                    {selectedChain.categories.gender
                      ? selectedChain.categories.gender.map((category, i) => {
                          return (
                            <Typography component="p" key={i}>
                              {t(`${category}`)} {t("clothing")}
                            </Typography>
                          );
                        })
                      : null}
                  </div>
                  <Typography component="h3">{t("sizes")}:</Typography>
                  <div id="sizes-container">
                    {selectedChain.categories.size
                      ? selectedChain.categories.size.map((size, i) => {
                          return (
                            <Typography key={i} component="p">
                              {size}
                            </Typography>
                          );
                        })
                      : null}
                  </div>
                </div>
              </CardContent>

              {role === "admin" ? (
                <CardActions>
                  <Button
                    key={"btn-join"}
                    variant="outlined"
                    color="primary"
                    className={"card-button"}
                    onClick={(e) => signupToChain(e)}
                  >
                    {t("join")}
                  </Button>
                  <Button
                    key={"btn-view"}
                    variant="contained"
                    color="primary"
                    className={"card-button"}
                    onClick={(e) => viewChain(e)}
                  >
                    {t("viewChain")}
                  </Button>{" "}
                </CardActions>
              ) : (
                <CardActions className={classes.cardsAction}>
                  <Button
                    key={"btn-join"}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={(e) => signupToChain(e)}
                  >
                    {t("join")}
                    <img src={RightArrow} alt="" />
                  </Button>
                </CardActions>
              )}
            </Card>
          </Popup>
        ) : null}
      </ReactMapGL>

      <div className="map-actions">
        <Button className="map-action-btn" onClick={() => handleLocation()}>
          <GpsFixedIcon fontSize="medium" />
        </Button>
        <Button
          className="map-action-btn"
          onClick={() => mapZoom(viewport, "+")}
        >
          <AddIcon fontSize="medium" />
        </Button>
        <Button
          className="map-action-btn"
          onClick={() => mapZoom(viewport, "-")}
        >
          <RemoveIcon fontSize="medium" />{" "}
        </Button>
      </div>
    </>
  );
};

export default FindChain;
