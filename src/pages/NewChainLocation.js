import React, { useState } from "react";
import Geocoder from "react-mapbox-gl-geocoder";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { addChain } from "../util/firebase/chain";
import { Redirect } from "react-router-dom";

// Material
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

const mapAccess = {
  mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_KEY,
};

const mapStyle = {
  width: "100%",
  height: 600,
};

const queryParams = {
  country: "nl",
};

const NewChainLocation = () => {
  const [state, setState] = useState({
    viewport: {},
    name: "",
    loading: true,
    addressDetails: false,
    marker: false,
  });

  const [changePage, setChangePage] = useState(!null);
  const [description, setDescription] = useState("");

  const onSelected = (viewport, item) => {
    setState({
      viewport: viewport,
      name: item.place_name,
      addressDetails: true,
      marker: true,
    });

    console.log("Selected: ", item);
    console.log(viewport);
  };

  const handleChange = (e) => {
    setDescription(e.target.value);
    console.log(description);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newChain = {
      latLon: {
        latitude: state.viewport.latitude,
        longitude: state.viewport.longitude,
      },
      name: state.name,
      description: description,
    };
    console.log(newChain);
    addChain(newChain);
    setChangePage(null);
  };

  return changePage ? (
    <Grid container>
      <Grid item sm>
        <Typography variant="h3">{"Enter new chain address"}</Typography>
        <Typography variant="p">{"Search for address"}</Typography>

        <Geocoder
          {...mapAccess}
          onSelected={onSelected}
          viewport={state.viewport}
          hideOnSelect={true}
          queryParams={queryParams}
          value={state.item}
        />

        {state.addressDetails ? (
          <div className={"address-details"}>
            <Typography variant="h4">{"selected address:"}</Typography>
            <Typography variant="p">{state.name}</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                id="description"
                name="description"
                type="text"
                label={"description of the chain"}
                // className={classes.textField}
                // helperText={errors.name}
                // error={errors.name ? true : false}
                value={description}
                onChange={handleChange}
                fullWidth
              ></TextField>
              <Button type="submit" variant="contained" color="primary">
                {"submit"}
              </Button>{" "}
            </form>
          </div>
        ) : null}
      </Grid>
      <Grid item sm>
        <ReactMapGL
          {...mapAccess}
          {...state.viewport}
          {...mapStyle}
          onViewportChange={(newViewport) =>
            setState({ viewport: newViewport })
          }
          mapStyle="mapbox://styles/mapbox/streets-v11"
        >
          {state.marker ? (
            <Marker
              key={state.name}
              latitude={state.viewport.latitude}
              longitude={state.viewport.longitude}
            >
              {" "}
              <img
                id="marker"
                src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png"
                alt="Map Marker"
              />
            </Marker>
          ) : null}
        </ReactMapGL>
      </Grid>
    </Grid>
  ) : (
    <Redirect to="/thankyou" />
  );
};

export default NewChainLocation;
