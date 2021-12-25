import { useState } from "react";
import { Helmet } from "react-helmet";
import ReactMapGL, { MapEvent, SVGOverlay, FlyToInterpolator } from "react-map-gl";
import destination from "@turf/destination";

// Material UI
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

// Project resources
import theme from "../util/theme";
import Geocoding from "./Geocoding";
// import { TwoColumnLayout } from "../components/Layouts";
import { IChain, IViewPort } from "../types";
import { number } from "yup/lib/locale";

const accessToken = process.env.REACT_APP_MAPBOX_KEY || '';

type Coordinates = {
  longitude: number;
  latitude: number;
};

const NewChainLocation = () => {
  const classes = makeStyles(theme as any)();
  const [loopLocation, setLoopLocation] = useState<Coordinates | null>(null);
  const [viewport, setViewport] = useState<IViewPort>({
    longitude: 0,
    latitude: 0,
    width: "40vw",
    height: "40vh",
    zoom: 1,
  });

  const redrawLoop = ({ project }: {project: any}) => {
    const centerCoords = [loopLocation!.longitude, loopLocation!.latitude];
    const [centerX, centerY] = project(centerCoords);
    // get the coordinates of a point the right distance away from center
    const boundaryPoint = destination(
      centerCoords,
      3,  // this should be the selected distance
      0,  // due north
      {units: "kilometers"},
    );
    const [_, boundaryY] = project(boundaryPoint.geometry.coordinates);
    const radius = centerY - boundaryY;

    return (
      <>
        <defs>
            <radialGradient id="feather">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.4" />
                <stop offset="50%" stopColor={theme.palette.primary.main} stopOpacity="0.4"/>
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0"/>
            </radialGradient>
        </defs>
        <circle cx={centerX} cy={centerY} r={radius} fill="url(#feather)" />;
      </>
    );
  };

  const flyToLocation = (longitude: number, latitude: number) => {
    setViewport({
      ...viewport,
      longitude: longitude,
      latitude: latitude,
      zoom:10,
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
    });
  };

  const handleGeolocationResult = ({result: {center}}: {result: {center: [number, number]} }) => {
    flyToLocation(...center);
  };

  const handleMapClick = (evt: MapEvent) => {
    const longitude = evt.lngLat[0];
    const latitude = evt.lngLat[1];
    setLoopLocation({ longitude: longitude, latitude: latitude });
    flyToLocation(longitude, latitude);
  };

  // we could use the TwoColumnLayout here
  return (
    <>
      <Helmet>
        <title>Clothing Loop | Create New Loop</title>
        <meta name="description" content="Create New Loop" />
      </Helmet>

      <div className={classes.formContainer}>
      <Grid container className={classes.form}>
        <Grid item sm>
          <Geocoding onResult={handleGeolocationResult} />
          <ReactMapGL
            mapboxApiAccessToken={accessToken}
            mapStyle="mapbox://styles/mapbox/light-v10"
            {...viewport}
            onViewportChange={(newView: IViewPort) => setViewport(newView)}
            onClick={handleMapClick}
            getCursor={() => "pointer"}
            className={classes.newLoopMap}
            width="100%"
          >
            {loopLocation !== null ? (
              <SVGOverlay redraw={redrawLoop} />
            ) : null}
          </ReactMapGL>
        </Grid>
        <Grid item sm>
        </Grid>
      </Grid>
    </div>
    </>
  );
};

export default NewChainLocation;
