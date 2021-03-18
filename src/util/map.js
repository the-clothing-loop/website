import React, { Component } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
"access token";

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: 4.89,
      lat: 52.37,
      zoom: 10,
    };
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    });
  }

  render() {
    return (
      <div>
        <div
          ref={(el) => (this.mapContainer = el)}
          style={{ width: "100vw", height: "100vh" }}
        ></div>
      </div>
    );
  }
}

export default Map;
