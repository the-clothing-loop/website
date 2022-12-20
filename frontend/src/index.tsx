import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./i18n";
import "./airbrake";
import "./tailwind.css";
import "https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js";
import "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js";

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
