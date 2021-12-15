import { useEffect, useState, useContext, FunctionComponent } from "react";
import { useHistory } from "react-router-dom";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

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
        mapboxApiAccessToken={accessToken.mapboxApiAccessToken}
        mapStyle="mapbox://styles/mapbox/light-v10"
        {...viewport}
        onViewportChange={(newView: IViewPort) => setViewport(newView)}
      >
        {filteredChains.map((chain) =>
          chain.published ? (
            <Marker
              key={chain.id}
              latitude={chain.latitude}
              longitude={chain.longitude}
            >
              {chain.categories.gender.includes("women") ? (
                <CircleIcon
                  style={{ color: "pink" }}
                  onClick={(e: any) => {
                    e.preventDefault();
                    setSelectedChain(chain);
                    setShowPopup(true);
                  }}
                />
              ) : chain.categories.gender.includes("men") ? (
                <CircleIcon
                  style={{ color: "blue" }}
                  onClick={(e: any) => {
                    e.preventDefault();
                    setSelectedChain(chain);
                    setShowPopup(true);
                  }}
                />
              ) : (
                <CircleIcon
                  style={{ color: "red" }}
                  onClick={(e: any) => {
                    e.preventDefault();
                    setSelectedChain(chain);
                    setShowPopup(true);
                  }}
                />
              )}
            </Marker>
          ) : null
        )}
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
