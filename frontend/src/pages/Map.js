import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useTranslation } from "react-i18next";
import getUserLocation from "../util/api";

// Material UI
import { Button } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

// Project resources
import { getChains } from "../util/firebase/chain";

const accessToken = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
  ipinfoApiAccessToken: process.env.REACT_APP_IPINFO_API_KEY,
};

const Map = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const styles = (theme) => ({
    ...theme.spreadThis,
  });

  const [viewport, setViewport] = useState([]);
  const [chainData, setChainData] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(async () => {
    const chainResponse = await getChains();
    setChainData(chainResponse);
    const userLocationResponse = await getUserLocation(accessToken.ipinfoApiAccessToken);
    if (userLocationResponse.loc) {
      setViewport({
        latitude: Number(userLocationResponse.loc.split(",")[0]),
        longitude: Number(userLocationResponse.loc.split(",")[1]),
        width: "100vw",
        height: "100vh",
        zoom: 10,
      });
    } else {
      console.error("Couldn't receive location");
      console.error(userLocationResponse);
    }
  }, []);

  if (!accessToken.mapboxApiAccessToken || !accessToken.ipinfoApiAccessToken) {
    return <div>Access tokens not configured</div>;
  }

  return (
    <ReactMapGL
      mapboxApiAccessToken={accessToken.mapboxApiAccessToken}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      {...viewport}
      onViewportChange={(newView) => setViewport(newView)}
    >
      {chainData.map((chain) => (
        <Marker
          key={chain.id}
          latitude={chain.latLon.latitude}
          longitude={chain.latLon.longitude}
          onClick={(e) => {
            e.preventDefault();
            setSelectedChain(chain);
            setShowPopup(true);
          }}
        >
          {" "}
          <img
            id="marker"
            src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png"
            alt="Map Marker"
          />
        </Marker>
      ))}

      {selectedChain && showPopup ? (
        <Popup
          latitude={selectedChain.latLon.latitude}
          longitude={selectedChain.latLon.longitude}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
          dynamicPosition={false}
        >
          <Card className={styles.root}>
            <CardContent>
              <Typography
                className={styles.title}
                color="secondary.dark"
                component="p"
                variant="h4"
                gutterBottom
              >
                {selectedChain.name}
              </Typography>
              <Typography
                variant="body2"
                component="p"
                className={"chain-address"}
              >
                {selectedChain.address}
              </Typography>
              <Typography variant="body2" component="p">
                {selectedChain.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                className={"card-button"}
                onClick={(e) => {
                  e.preventDefault();
                  history.push({
                    pathname: "/signup",
                    search: `?chain=${selectedChain.name}`,
                    state: {
                      chainId: selectedChain.id,
                    },
                  });
                }}
              >
                {t("signup")}
              </Button>{" "}
              <Button
                variant="contained"
                color="secondary"
                className={"card-button"}
                onClick={(e) => {
                  e.preventDefault();
                  history.push(`/chains/${selectedChain.id}`);
                }}
              >
                {t("viewChain")}
              </Button>{" "}
            </CardActions>
          </Card>
        </Popup>
      ) : null}
    </ReactMapGL>
  );
};

export default Map;
