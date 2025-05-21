import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import axois from "./api/axios";
import { IS_WEB } from "./utils/is_web";

axois.defaults.withCredentials = IS_WEB;

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
);
