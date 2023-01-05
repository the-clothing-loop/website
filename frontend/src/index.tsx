import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./i18n";
import "./airbrake";

// stylesheets
import "mapbox-gl/dist/mapbox-gl.css";

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={Fallback}>
      <App />
    </Suspense>
    {/* <Fallback /> */}
  </React.StrictMode>,
  document.getElementById("root")
);

function Fallback() {
  return (
    <div className="w-screen min-h-screen">
      <div className="container mx-auto bg-white flex flex-row justify-between lg:justify-start items-center md:px-20">
        <div className="w-32 md:w-40 h-20 md:h-28 animate-pulse">
          <div
            className="bg-center w-32 md:w-40 h-20 md:h-28 bg-no-repeat relative z-[60] bg-[auto_120px] md:bg-[auto_139px]"
            style={{
              backgroundImage:
                "url('https://ucarecdn.com/886c01f0-c666-44dc-9d2a-cea4893ed134/-/resize/x139/-/format/auto/-/quality/smart/the_clothing_loop_logo.png')",
            }}
          ></div>
        </div>

        <div className="mr-3 btn-lg btn-circle btn-ghost flex justify-center items-center lg:hidden relative ring-teal">
          <span className="feather feather-menu text-2xl animate-pulse" />
        </div>

        <div className="hidden lg:flex items-center justify-end flex-grow">
          <div className="h-10 bg-grey-light animate-pulse w-2/3"></div>
        </div>
      </div>

      <div className="container mx-auto flex p-4 md:px-20 flex-wrap sm:flex-nowrap flex-col md:flex-row">
        <div className="h-10 bg-grey-light animate-pulse w-full"></div>
      </div>

      <div className="bg-teal-light h-[600px] flex justify-center items-center animate-pulse font-bold opacity-50">
        Loading...
      </div>
    </div>
  );
}
