import { useEffect, useState, useContext, useRef } from 'react';
import { useHistory } from "react-router-dom";
import ReactMapGL, {
  Source,
  Layer,
  Popup,
  MapEvent,
  MapRef,
} from 'react-map-gl';
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import * as GeoJSONTypes from 'geojson';

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

// Project resources
import { getChains } from "../util/firebase/chain";
import { AuthContext } from "../components/AuthProvider";
import { addUserToChain } from "../util/firebase/chain";
import { IChain, IViewPort } from "../types";
import theme from "../util/theme";
import { getUserById } from "../util/firebase/user";
import SearchBar from "../components/SearchBar";

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};

const FindChain = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const classes = makeStyles(theme as any)();

  const [viewport, setViewport] = useState<IViewPort | {}>({});
  const [chainData, setChainData] = useState<IChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<IChain | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [filteredChains, setFilteredChains] = useState<IChain[]>([]);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string | null>(null);

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    (async () => {
      const chainResponse = await getChains();
      setChainData(chainResponse);
      setFilteredChains(chainResponse);

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
          height: "95vh",
          zoom: 10,
        });
      },
      (err) => {
        console.error(`Couldn't receive location: ${err.message}`);
      }
    );
  };

  const mapZoom = (viewport: IViewPort | {}, operation: string) => {
    if ("zoom" in viewport) {
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

    if (layerId === 'chains') {
      const selectedChainIndex = topMostFeature.properties.chainIndex;

      setSelectedChain(filteredChains[selectedChainIndex]);
      setShowPopup(true);
    } else if (layerId === 'cluster' || layerId === 'cluster-count') {
      const clusterId = topMostFeature.properties.cluster_id;

      const mapboxSource = mapRef!.current!.getMap().getSource('chains');

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
      type: 'FeatureCollection',
      features: filteredChains
        .filter(({ published }) => published)
        .map((filteredChain, filteredChainIndex) => {
        const {
          longitude,
          latitude,
          categories: { gender },
        } = filteredChain;

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          properties: {
            chainIndex: filteredChainIndex,
              gender: gender.includes('women')
                ? 'woman'
                : gender.includes('men')
                ? 'men'
                : 'children', // GeoJSON doesn't support nested array, see https://github.com/mapbox/mapbox-gl-js/issues/2434
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
      <SearchBar
        data={chainData}
        setData={setFilteredChains}
        setViewport={setViewport}
      />
      <ReactMapGL
        className={"main-map"}
        mapboxApiAccessToken={accessToken.mapboxApiAccessToken}
        mapStyle="mapbox://styles/mapbox/light-v10"
        {...viewport}
        onViewportChange={(newView: IViewPort) => setViewport(newView)}
        onClick={handleMapClick}
        ref={mapRef}
      >
        <Source
          id="chains"
          type="geojson"
          data={geoJSONFilteredChains}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
            >
          <Layer
            id="chains"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'match',
                ['get', 'gender'],
                'women',
                'pink',
                'men',
                'blue',
                'red',
              ],
              'circle-radius': 30,
              'circle-blur': 0.7,
                  }}
                />
          <Layer
            id="cluster"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1',
              ],
              'circle-radius': 30,
              'circle-blur': 0.7,
                  }}
                />
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
                  }}
            paint={{ 'text-color': 'white' }}
                />
        </Source>

        {selectedChain && showPopup ? (
          <Popup
            latitude={selectedChain.latitude}
            longitude={selectedChain.longitude}
            closeOnClick={false}
            dynamicPosition={true}
            onClose={() => setShowPopup(false)}
          >
            <Card
              className={classes.card}
              style={{ borderRadius: "8px", padding: "10px 10px 15px" }}
            >
              <CardContent className={classes.cardContent}>
                <Typography component="h1" gutterBottom>
                  {selectedChain.name}
                </Typography>
                <Typography component="h2">
                  {selectedChain.description}
                </Typography>
                <div className={"chain-categories"}>
                  <Typography component="p">{t("categories")}:</Typography>
                  <div id="categories-container">
                    {selectedChain.categories.gender
                      ? selectedChain.categories.gender.map((category, i) => {
                          return (
                            <Typography component="h3" key={i}>
                              {t(`${category}`)} {t("clothing")}
                            </Typography>
                          );
                        })
                      : null}
                  </div>
                  <Typography component="p">{t("sizes")}:</Typography>
                  <div id="sizes-container">
                    {selectedChain.categories.size
                      ? selectedChain.categories.size.map((size, i) => {
                          return (
                            <Typography key={i} component="h3">
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
                <CardActions>
                  <Button
                    key={"btn-signup"}
                    variant="outlined"
                    color="primary"
                    className={classes.buttonOutlined}
                    onClick={(e) => setShowPopup(false)}
                  >
                    {t("close")}
                  </Button>
                  <Button
                    key={"btn-join"}
                    variant="contained"
                    color="primary"
                    className={classes.buttonContained}
                    onClick={(e) => signupToChain(e)}
                  >
                    {t("join")}
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
