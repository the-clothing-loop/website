import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./i18n";
import "./airbrake";

// stylesheets
import "./tailwind.css";
import "mapbox-gl/dist/mapbox-gl.css";

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
